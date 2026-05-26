"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

type ActionResult = { ok: true } | { ok: false; error: string }

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  const role = (p as { role?: string } | null)?.role
  if (role !== "admin" && role !== "super_admin") return null
  return user.id
}

export async function reviewVerificationDoc(
  docId: string,
  status: "approved" | "rejected" | "resubmit",
  notes: string,
): Promise<ActionResult> {
  try {
    const adminId = await requireAdmin()
    if (!adminId) return { ok: false, error: "Admins only." }

    const admin = createAdminClient()
    await admin
      .from("seller_verification_docs")
      .update({
        status,
        notes: notes || null,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", docId)

    await admin.from("moderation_logs").insert({
      admin_id: adminId,
      action: `verification:${status}`,
      target_kind: "verification_doc",
      target_id: docId,
      notes,
    })

    revalidatePath("/admin/sellers")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function approveSeller(sellerId: string): Promise<ActionResult> {
  try {
    const adminId = await requireAdmin()
    if (!adminId) return { ok: false, error: "Admins only." }
    const admin = createAdminClient()
    await admin
      .from("seller_profiles")
      .update({ is_verified: true, verified_at: new Date().toISOString() })
      .eq("id", sellerId)
    await admin.from("profiles").update({ is_verified: true }).eq("id", sellerId)
    await admin.rpc("award_badge", { p_user_id: sellerId, p_slug: "verified_seller" })
    await admin.from("notifications").insert({
      user_id: sellerId,
      kind: "system",
      title: "You are now a verified seller",
      body: "Welcome to the verified circle — your shop now shows the verified badge.",
      action_url: "/seller/dashboard",
    })
    await admin.from("moderation_logs").insert({
      admin_id: adminId,
      action: "seller_approved",
      target_kind: "seller",
      target_id: sellerId,
    })
    revalidatePath("/admin/sellers")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}
