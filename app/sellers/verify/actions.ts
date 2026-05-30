"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { uploadFile } from "@/lib/storage/upload"

type DocKind = "pan" | "aadhaar" | "gst" | "address_proof" | "bank_details"
const REQUIRED: DocKind[] = ["pan", "aadhaar", "address_proof"]

type ActionResult = { ok: true } | { ok: false; error: string }

export async function submitVerification(formData: FormData): Promise<ActionResult | void> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." }
  const userId = session.user.id

  const businessName = String(formData.get("business_name") ?? "").trim()
  const legalName    = String(formData.get("legal_name") ?? "").trim() || null
  const gstNumber    = String(formData.get("gst_number") ?? "").trim() || null
  const panNumber    = String(formData.get("pan_number") ?? "").trim() || null
  const mobile       = String(formData.get("mobile") ?? "").trim() || null
  const website      = String(formData.get("website") ?? "").trim() || null

  if (!businessName) return { ok: false, error: "Shop / business name is required." }

  const socials: Record<string, string> = {}
  for (const key of ["instagram", "twitter", "facebook", "youtube", "linkedin"] as const) {
    const v = String(formData.get(`social_${key}`) ?? "").trim()
    if (v) socials[key] = v
  }

  const address = {
    line1:       String(formData.get("addr_line1") ?? "").trim(),
    line2:       String(formData.get("addr_line2") ?? "").trim() || null,
    city:        String(formData.get("addr_city") ?? "").trim(),
    state:       String(formData.get("addr_state") ?? "").trim(),
    postal_code: String(formData.get("addr_postal") ?? "").trim(),
    country:     String(formData.get("addr_country") ?? "IN"),
  }
  if (!address.line1 || !address.city || !address.state || !address.postal_code) {
    return { ok: false, error: "Complete registered address is required." }
  }

  const shopLine1 = String(formData.get("shop_addr_line1") ?? "").trim()
  const shopAddress = shopLine1
    ? {
        line1:       shopLine1,
        line2:       String(formData.get("shop_addr_line2") ?? "").trim() || null,
        city:        String(formData.get("shop_addr_city") ?? "").trim(),
        state:       String(formData.get("shop_addr_state") ?? "").trim(),
        postal_code: String(formData.get("shop_addr_postal") ?? "").trim(),
        country:     String(formData.get("shop_addr_country") ?? "IN"),
      }
    : null

  const bank = {
    account_holder: String(formData.get("bank_holder") ?? "").trim() || null,
    account_number: String(formData.get("bank_account") ?? "").trim() || null,
    ifsc:           String(formData.get("bank_ifsc") ?? "").trim() || null,
  }

  await prisma.sellerProfile.upsert({
    where:  { id: userId },
    create: {
      id: userId,
      business_name: businessName,
      legal_name:    legalName,
      gst_number:    gstNumber,
      pan_number:    panNumber,
      mobile,
      website,
      socials,
      address,
      ...(shopAddress ? { shop_address: shopAddress } : {}),
      bank_details:  bank,
      is_verified:   false,
    },
    update: {
      business_name: businessName,
      legal_name:    legalName,
      gst_number:    gstNumber,
      pan_number:    panNumber,
      mobile,
      website,
      socials,
      address,
      ...(shopAddress ? { shop_address: shopAddress } : {}),
      bank_details:  bank,
    },
  })

  // Grant seller role immediately so they get creator-level access
  await prisma.user.update({
    where: { id: userId },
    data:  { role: "seller" },
  })

  const kinds: DocKind[] = ["pan", "aadhaar", "gst", "address_proof", "bank_details"]
  const uploaded: Array<{ kind: DocKind; file_url: string }> = []

  for (const kind of kinds) {
    const file = formData.get(`doc_${kind}`) as File | null
    if (!file || !file.size) continue
    const result = await uploadFile(file, {
      folder:       `verification/seller/${userId}`,
      publicId:     kind,
      resourceType: "raw",
    })
    uploaded.push({ kind, file_url: result.url })
  }

  const existingKinds = (
    await prisma.sellerVerificationDoc.findMany({
      where:  { seller_id: userId },
      select: { doc_kind: true },
    })
  ).map((d) => d.doc_kind)

  const missingRequired = REQUIRED.filter(
    (k) => !uploaded.find((u) => u.kind === k) && !existingKinds.includes(k),
  )
  if (missingRequired.length > 0) {
    return { ok: false, error: `Missing required documents: ${missingRequired.join(", ")}.` }
  }

  if (uploaded.length > 0) {
    await prisma.sellerVerificationDoc.createMany({
      data: uploaded.map((u) => ({
        seller_id: userId,
        doc_kind:  u.kind,
        file_url:  u.file_url,
        status:    "pending",
      })),
    })
  }

  revalidatePath("/seller/dashboard")
  redirect("/seller/dashboard?verification=submitted")
}
