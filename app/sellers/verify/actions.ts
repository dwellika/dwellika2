"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { uploadFile } from "@/lib/storage/upload"

type DocKind = "pan" | "aadhaar" | "gst" | "address_proof" | "bank_details" | "other"

const REQUIRED: DocKind[] = ["pan", "aadhaar", "address_proof"]

type ActionResult = { ok: true } | { ok: false; error: string }

export async function submitVerification(formData: FormData): Promise<ActionResult | void> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." }
  const userId = session.user.id

  const businessName = String(formData.get("business_name") ?? "").trim()
  const legalName = String(formData.get("legal_name") ?? "").trim() || null
  const gstNumber = String(formData.get("gst_number") ?? "").trim() || null
  const panNumber = String(formData.get("pan_number") ?? "").trim() || null
  const bank = {
    account_holder: String(formData.get("bank_holder") ?? "").trim(),
    account_number: String(formData.get("bank_account") ?? "").trim(),
    ifsc: String(formData.get("bank_ifsc") ?? "").trim(),
  }
  const address = {
    line1: String(formData.get("addr_line1") ?? "").trim(),
    line2: String(formData.get("addr_line2") ?? "").trim() || null,
    city: String(formData.get("addr_city") ?? "").trim(),
    state: String(formData.get("addr_state") ?? "").trim(),
    postal_code: String(formData.get("addr_postal") ?? "").trim(),
    country: String(formData.get("addr_country") ?? "IN"),
  }

  if (!businessName) return { ok: false, error: "Business name is required." }

  await prisma.sellerProfile.upsert({
    where: { id: userId },
    create: {
      id: userId,
      business_name: businessName,
      legal_name: legalName,
      gst_number: gstNumber,
      pan_number: panNumber,
      address,
      bank_details: bank,
      is_verified: false,
    },
    update: {
      business_name: businessName,
      legal_name: legalName,
      gst_number: gstNumber,
      pan_number: panNumber,
      address,
      bank_details: bank,
    },
  })

  const kinds: DocKind[] = ["pan", "aadhaar", "gst", "address_proof", "bank_details"]
  const uploaded: Array<{ kind: DocKind; file_url: string }> = []

  for (const kind of kinds) {
    const file = formData.get(`doc_${kind}`) as File | null
    if (!file || !file.size) continue
    const result = await uploadFile(file, { folder: `verification/${userId}`, publicId: kind, resourceType: "raw" })
    uploaded.push({ kind, file_url: result.url })
  }

  const missingRequired = REQUIRED.filter((k) => !uploaded.find((u) => u.kind === k))
  if (missingRequired.length > 0) {
    return { ok: false, error: `Missing required documents: ${missingRequired.join(", ")}.` }
  }

  if (uploaded.length > 0) {
    await prisma.sellerVerificationDoc.createMany({
      data: uploaded.map((u) => ({
        seller_id: userId,
        doc_kind: u.kind,
        file_url: u.file_url,
        status: "pending",
      })),
    })
  }

  revalidatePath("/seller/dashboard")
  redirect("/seller/dashboard?verification=submitted")
}
