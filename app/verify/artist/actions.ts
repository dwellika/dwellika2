"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { uploadFile } from "@/lib/storage/upload"

type ArtistDocKind = "pan" | "aadhaar" | "address_proof" | "portfolio" | "other"
const REQUIRED_DOCS: ArtistDocKind[] = ["pan", "aadhaar"]

type ActionResult = { ok: true } | { ok: false; error: string }

export async function submitArtistVerification(
  formData: FormData,
): Promise<ActionResult | void> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." }
  const userId = session.user.id

  // ── Collect text fields ────────────────────────────────────────────────────
  const username   = String(formData.get("username") ?? "").trim() || null
  const mobile     = String(formData.get("mobile") ?? "").trim() || null
  const instagram  = String(formData.get("instagram_url") ?? "").trim() || null
  const pinterest  = String(formData.get("pinterest_url") ?? "").trim() || null
  const website    = String(formData.get("website") ?? "").trim() || null

  const otherSocials: Record<string, string> = {}
  for (const [platform, url] of [
    ["twitter", "twitter_url"],
    ["behance", "behance_url"],
    ["artstation", "artstation_url"],
    ["youtube", "youtube_url"],
    ["linkedin", "linkedin_url"],
  ] as const) {
    const v = String(formData.get(url) ?? "").trim()
    if (v) otherSocials[platform] = v
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
    return { ok: false, error: "Address (line 1, city, state, postal) is required." }
  }

  const bankDetails = {
    account_holder: String(formData.get("bank_holder") ?? "").trim() || null,
    account_number: String(formData.get("bank_account") ?? "").trim() || null,
    ifsc:           String(formData.get("bank_ifsc") ?? "").trim() || null,
    bank_name:      String(formData.get("bank_name") ?? "").trim() || null,
  }

  // ── Upsert ArtistVerification ──────────────────────────────────────────────
  const record = await prisma.artistVerification.upsert({
    where:  { user_id: userId },
    create: {
      user_id:       userId,
      status:        "draft",
      full_name:     session.user.full_name ?? session.user.name ?? "",
      email:         session.user.email ?? null,
      username,
      mobile,
      address,
      instagram_url: instagram,
      pinterest_url: pinterest,
      other_socials: otherSocials,
      website,
      bank_details:  bankDetails,
    },
    update: {
      username,
      mobile,
      address,
      instagram_url: instagram,
      pinterest_url: pinterest,
      other_socials: otherSocials,
      website,
      bank_details:  bankDetails,
    },
    select: { id: true },
  })

  // ── Upload documents ───────────────────────────────────────────────────────
  const docKinds: ArtistDocKind[] = ["pan", "aadhaar", "address_proof", "portfolio", "other"]
  const uploaded: { kind: ArtistDocKind; file_url: string }[] = []

  for (const kind of docKinds) {
    const file = formData.get(`doc_${kind}`) as File | null
    if (!file || !file.size) continue
    const result = await uploadFile(file, {
      folder: `verification/artist/${userId}`,
      publicId: kind,
      resourceType: "raw",
    })
    uploaded.push({ kind, file_url: result.url })
  }

  const existingKinds = (
    await prisma.artistVerificationDoc.findMany({
      where:  { verification_id: record.id },
      select: { doc_kind: true },
    })
  ).map((d) => d.doc_kind)

  const missingRequired = REQUIRED_DOCS.filter(
    (k) => !uploaded.find((u) => u.kind === k) && !existingKinds.includes(k),
  )
  if (missingRequired.length > 0) {
    return {
      ok: false,
      error: `Missing required documents: ${missingRequired.join(", ")}.`,
    }
  }

  if (uploaded.length > 0) {
    await prisma.artistVerificationDoc.createMany({
      data: uploaded.map((u) => ({
        verification_id: record.id,
        doc_kind:        u.kind,
        file_url:        u.file_url,
        status:          "pending",
      })),
    })
  }

  // ── Mark as submitted ──────────────────────────────────────────────────────
  await prisma.artistVerification.update({
    where: { id: record.id },
    data:  { status: "submitted", submitted_at: new Date() },
  })

  // Set role to artist (pending) so the user gets creator access immediately
  await prisma.user.update({
    where: { id: userId },
    data:  { role: "artist" },
  })

  // Ensure ArtistProfile stub exists
  await prisma.artistProfile.upsert({
    where:  { id: userId },
    create: { id: userId, is_verified: false },
    update: {},
  })

  revalidatePath(`/u/${session.user.username ?? userId}`)
  redirect("/artist/dashboard?verification=submitted")
}

export async function saveDraft(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." }
  const userId = session.user.id

  const username  = String(formData.get("username") ?? "").trim() || null
  const mobile    = String(formData.get("mobile") ?? "").trim() || null
  const instagram = String(formData.get("instagram_url") ?? "").trim() || null
  const pinterest = String(formData.get("pinterest_url") ?? "").trim() || null
  const website   = String(formData.get("website") ?? "").trim() || null

  const address = {
    line1:       String(formData.get("addr_line1") ?? "").trim() || null,
    line2:       String(formData.get("addr_line2") ?? "").trim() || null,
    city:        String(formData.get("addr_city") ?? "").trim() || null,
    state:       String(formData.get("addr_state") ?? "").trim() || null,
    postal_code: String(formData.get("addr_postal") ?? "").trim() || null,
    country:     String(formData.get("addr_country") ?? "IN"),
  }

  const otherSocials: Record<string, string> = {}
  for (const [platform, key] of [
    ["twitter", "twitter_url"],
    ["behance", "behance_url"],
    ["artstation", "artstation_url"],
    ["youtube", "youtube_url"],
    ["linkedin", "linkedin_url"],
  ] as const) {
    const v = String(formData.get(key) ?? "").trim()
    if (v) otherSocials[platform] = v
  }

  await prisma.artistVerification.upsert({
    where:  { user_id: userId },
    create: {
      user_id:       userId,
      status:        "draft",
      full_name:     session.user.full_name ?? session.user.name ?? "",
      email:         session.user.email ?? null,
      username,
      mobile,
      address,
      instagram_url: instagram,
      pinterest_url: pinterest,
      other_socials: otherSocials,
      website,
    },
    update: {
      username,
      mobile,
      address,
      instagram_url: instagram,
      pinterest_url: pinterest,
      other_socials: otherSocials,
      website,
    },
  })

  revalidatePath("/verify/artist")
  return { ok: true }
}
