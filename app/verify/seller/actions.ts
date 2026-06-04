"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { uploadFile } from "@/lib/storage/upload"

type SellerDocKind = "pan" | "aadhaar" | "gst" | "address_proof" | "other"
const REQUIRED_DOCS: SellerDocKind[] = ["pan"]

type ActionResult = { ok: true } | { ok: false; error: string }

/** Pulls the common text fields shared by save-draft and submit. */
function collectFields(formData: FormData) {
  const businessName = String(formData.get("business_name") ?? "").trim()
  const legalName = String(formData.get("legal_name") ?? "").trim() || null
  const gst = String(formData.get("gst_number") ?? "").trim() || null
  const pan = String(formData.get("pan_number") ?? "").trim() || null
  const mobile = String(formData.get("mobile") ?? "").trim() || null
  const website = String(formData.get("website") ?? "").trim() || null

  const socials: Record<string, string> = {}
  for (const [platform, key] of [
    ["instagram", "instagram_url"],
    ["pinterest", "pinterest_url"],
    ["twitter", "twitter_url"],
    ["facebook", "facebook_url"],
    ["youtube", "youtube_url"],
  ] as const) {
    const v = String(formData.get(key) ?? "").trim()
    if (v) socials[platform] = v
  }

  const address = {
    line1: String(formData.get("addr_line1") ?? "").trim() || null,
    line2: String(formData.get("addr_line2") ?? "").trim() || null,
    city: String(formData.get("addr_city") ?? "").trim() || null,
    state: String(formData.get("addr_state") ?? "").trim() || null,
    postal_code: String(formData.get("addr_postal") ?? "").trim() || null,
    country: String(formData.get("addr_country") ?? "IN"),
  }

  const shopAddress = {
    line1: String(formData.get("shop_line1") ?? "").trim() || null,
    line2: String(formData.get("shop_line2") ?? "").trim() || null,
    city: String(formData.get("shop_city") ?? "").trim() || null,
    state: String(formData.get("shop_state") ?? "").trim() || null,
    postal_code: String(formData.get("shop_postal") ?? "").trim() || null,
    country: String(formData.get("shop_country") ?? "IN"),
  }

  const bankDetails = {
    account_holder: String(formData.get("bank_holder") ?? "").trim() || null,
    account_number: String(formData.get("bank_account") ?? "").trim() || null,
    ifsc: String(formData.get("bank_ifsc") ?? "").trim() || null,
    bank_name: String(formData.get("bank_name") ?? "").trim() || null,
  }

  return { businessName, legalName, gst, pan, mobile, website, socials, address, shopAddress, bankDetails }
}

export async function submitSellerVerification(
  formData: FormData,
): Promise<ActionResult | void> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." }
  const userId = session.user.id

  const f = collectFields(formData)

  // Shop name is optional in the spec but the schema requires business_name —
  // fall back to the user's display name when no shop name is provided.
  const businessName = f.businessName || session.user.full_name || session.user.name || "My shop"

  if (!f.address.line1 || !f.address.city || !f.address.state || !f.address.postal_code) {
    return { ok: false, error: "Address (line 1, city, state, postal) is required." }
  }

  // ── Upsert SellerProfile ──────────────────────────────────────────────────
  await prisma.sellerProfile.upsert({
    where: { id: userId },
    create: {
      id: userId,
      business_name: businessName,
      legal_name: f.legalName,
      gst_number: f.gst,
      pan_number: f.pan,
      mobile: f.mobile,
      website: f.website,
      socials: f.socials,
      address: f.address,
      shop_address: f.shopAddress,
      bank_details: f.bankDetails,
      status: "submitted",
      submitted_at: new Date(),
    },
    update: {
      business_name: businessName,
      legal_name: f.legalName,
      gst_number: f.gst,
      pan_number: f.pan,
      mobile: f.mobile,
      website: f.website,
      socials: f.socials,
      address: f.address,
      shop_address: f.shopAddress,
      bank_details: f.bankDetails,
      status: "submitted",
      submitted_at: new Date(),
    },
  })

  // ── Upload KYC documents ───────────────────────────────────────────────────
  const docKinds: SellerDocKind[] = ["pan", "aadhaar", "gst", "address_proof", "other"]
  const uploaded: { kind: SellerDocKind; file_url: string }[] = []

  for (const kind of docKinds) {
    const file = formData.get(`doc_${kind}`) as File | null
    if (!file || !file.size) continue
    const result = await uploadFile(file, {
      folder: `verification/seller/${userId}`,
      publicId: kind,
      resourceType: "raw",
    })
    uploaded.push({ kind, file_url: result.url })
  }

  const existingKinds = (
    await prisma.sellerVerificationDoc.findMany({
      where: { seller_id: userId },
      select: { doc_kind: true },
    })
  ).map((d) => d.doc_kind)

  const missingRequired = REQUIRED_DOCS.filter(
    (k) => !uploaded.find((u) => u.kind === k) && !existingKinds.includes(k),
  )
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

  // Grant seller role immediately (pending verification badge approval)
  await prisma.user.update({ where: { id: userId }, data: { role: "seller" } })

  revalidatePath(`/u/${session.user.username ?? userId}`)
  redirect("/seller/dashboard?verification=submitted")
}

export async function saveSellerDraft(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." }
  const userId = session.user.id

  const f = collectFields(formData)
  const businessName = f.businessName || session.user.full_name || session.user.name || "My shop"

  await prisma.sellerProfile.upsert({
    where: { id: userId },
    create: {
      id: userId,
      business_name: businessName,
      legal_name: f.legalName,
      gst_number: f.gst,
      pan_number: f.pan,
      mobile: f.mobile,
      website: f.website,
      socials: f.socials,
      address: f.address,
      shop_address: f.shopAddress,
      bank_details: f.bankDetails,
      status: "draft",
    },
    update: {
      business_name: businessName,
      legal_name: f.legalName,
      gst_number: f.gst,
      pan_number: f.pan,
      mobile: f.mobile,
      website: f.website,
      socials: f.socials,
      address: f.address,
      shop_address: f.shopAddress,
      bank_details: f.bankDetails,
    },
  })

  revalidatePath("/verify/seller")
  return { ok: true }
}
