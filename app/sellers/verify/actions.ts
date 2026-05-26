"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

type DocKind = "pan" | "aadhaar" | "gst" | "address_proof" | "bank_details" | "other"

const REQUIRED: DocKind[] = ["pan", "aadhaar", "address_proof"]

type ActionResult = { ok: true } | { ok: false; error: string }

export async function submitVerification(formData: FormData): Promise<ActionResult | void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Not authenticated." }

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

  // Upsert seller profile
  const { error: profileErr } = await supabase.from("seller_profiles").upsert(
    {
      id: user.id,
      business_name: businessName,
      legal_name: legalName,
      gst_number: gstNumber,
      pan_number: panNumber,
      address,
      bank_details: bank,
      is_verified: false,
    },
    { onConflict: "id" },
  )
  if (profileErr) return { ok: false, error: profileErr.message }

  // Upload each document file
  const kinds: DocKind[] = ["pan", "aadhaar", "gst", "address_proof", "bank_details"]
  const uploaded: Array<{ kind: DocKind; storage_path: string }> = []

  for (const kind of kinds) {
    const file = formData.get(`doc_${kind}`) as File | null
    if (!file || !file.size) continue
    const ext = (file.name.split(".").pop() ?? "pdf").toLowerCase()
    const path = `${user.id}/verification/${kind}-${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage
      .from("verification")
      .upload(path, file, { contentType: file.type, upsert: true })
    if (upErr) return { ok: false, error: `Upload failed (${kind}): ${upErr.message}` }
    uploaded.push({ kind, storage_path: path })
  }

  const missingRequired = REQUIRED.filter((k) => !uploaded.find((u) => u.kind === k))
  if (missingRequired.length > 0) {
    return {
      ok: false,
      error: `Missing required documents: ${missingRequired.join(", ")}.`,
    }
  }

  // Insert verification doc rows
  if (uploaded.length > 0) {
    const { error: docsErr } = await supabase.from("seller_verification_docs").insert(
      uploaded.map((u) => ({
        seller_id: user.id,
        doc_kind: u.kind,
        storage_path: u.storage_path,
        status: "pending",
      })),
    )
    if (docsErr) return { ok: false, error: docsErr.message }
  }

  revalidatePath("/seller/dashboard")
  redirect("/seller/dashboard?verification=submitted")
}
