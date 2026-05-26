"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

type ActionResult<T = void> = { ok: true; data?: T } | { ok: false; error: string }

export async function openDispute(formData: FormData): Promise<ActionResult | void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Not authenticated." }

  const orderId = String(formData.get("order_id") ?? "")
  const reason = String(formData.get("reason") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim() || null

  if (!orderId || !reason) return { ok: false, error: "Missing order or reason." }

  // Verify the user is the buyer of this order
  const { data: order } = await supabase
    .from("orders")
    .select("buyer_id, order_items(seller_id)")
    .eq("id", orderId)
    .maybeSingle()
  const orderRow = order as
    | { buyer_id: string; order_items: { seller_id: string | null }[] }
    | null
  if (!orderRow) return { ok: false, error: "Order not found." }
  if (orderRow.buyer_id !== user.id) {
    return { ok: false, error: "Only the buyer can open a dispute." }
  }
  const sellerId = orderRow.order_items.find((i) => i.seller_id)?.seller_id
  if (!sellerId) return { ok: false, error: "No seller for this order." }

  // Upload evidence
  const evidence: Array<{ url: string; name: string }> = []
  const files = formData.getAll("evidence") as File[]
  for (const f of files) {
    if (!f || !f.size) continue
    const ext = (f.name.split(".").pop() ?? "bin").toLowerCase()
    const path = `${user.id}/disputes/${Date.now()}-${f.name}`
    const { error: upErr } = await supabase.storage
      .from("artworks")
      .upload(path, f, { contentType: f.type })
    if (upErr) return { ok: false, error: upErr.message }
    const { data: pub } = supabase.storage.from("artworks").getPublicUrl(path)
    evidence.push({ url: pub.publicUrl, name: f.name })
    void ext
  }

  const { data: dispute, error } = await supabase
    .from("disputes")
    .insert({
      order_id: orderId,
      opened_by: user.id,
      against_id: sellerId,
      reason,
      description,
      evidence,
      status: "open",
    })
    .select("id")
    .single()
  if (error || !dispute) return { ok: false, error: error?.message ?? "Failed." }
  const disputeId = (dispute as { id: string }).id

  // Notify seller + admins
  const admin = createAdminClient()
  await admin.from("notifications").insert([
    {
      user_id: sellerId,
      kind: "system",
      title: "A dispute was opened on one of your orders",
      body: reason,
      action_url: `/disputes/${disputeId}`,
    },
  ])

  revalidatePath("/disputes")
  redirect(`/disputes/${disputeId}`)
}

export async function postDisputeMessage(
  disputeId: string,
  body: string,
): Promise<ActionResult> {
  try {
    if (!body.trim()) return { ok: false, error: "Empty message." }
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: "Not authenticated." }
    const { error } = await supabase
      .from("dispute_messages")
      .insert({ dispute_id: disputeId, sender_id: user.id, body: body.trim() })
    if (error) return { ok: false, error: error.message }
    revalidatePath(`/disputes/${disputeId}`)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function resolveDispute(
  disputeId: string,
  resolution: string,
  outcome: "resolved" | "rejected",
): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: "Not authenticated." }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()
    const role = (profile as { role?: string } | null)?.role
    if (role !== "admin" && role !== "super_admin") {
      return { ok: false, error: "Admins only." }
    }

    const admin = createAdminClient()
    const { data: dispute } = await admin
      .from("disputes")
      .update({
        status: outcome,
        resolution,
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", disputeId)
      .select("opened_by, against_id")
      .single()

    const d = dispute as { opened_by: string; against_id: string } | null
    if (d) {
      await admin.from("notifications").insert([
        {
          user_id: d.opened_by,
          kind: "system",
          title: `Dispute ${outcome}`,
          body: resolution,
          action_url: `/disputes/${disputeId}`,
        },
        {
          user_id: d.against_id,
          kind: "system",
          title: `Dispute ${outcome}`,
          body: resolution,
          action_url: `/disputes/${disputeId}`,
        },
      ])
    }

    revalidatePath(`/disputes/${disputeId}`)
    revalidatePath("/admin/disputes")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}
