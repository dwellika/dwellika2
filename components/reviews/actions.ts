"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import type { ReviewTarget } from "@/lib/types/database"

type ActionResult = { ok: true } | { ok: false; error: string }

export async function submitReview(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Sign in to leave a review." }

  const targetKind = String(formData.get("targetKind") ?? "") as ReviewTarget
  const targetId = String(formData.get("targetId") ?? "")
  const orderId = (formData.get("orderId") as string) || null
  const rating = Number(formData.get("rating") ?? 0)
  const body = String(formData.get("body") ?? "").trim() || null

  if (!targetKind || !targetId) return { ok: false, error: "Missing review target." }
  if (rating < 1 || rating > 5) return { ok: false, error: "Pick a rating from 1 to 5." }

  // If an order ID is supplied, verify the buyer actually owns it.
  let isVerifiedPurchase = false
  if (orderId) {
    const { data: ord } = await supabase
      .from("orders")
      .select("id, buyer_id, status")
      .eq("id", orderId)
      .maybeSingle()
    isVerifiedPurchase =
      Boolean(ord) &&
      (ord as { buyer_id?: string }).buyer_id === user.id &&
      (ord as { status?: string }).status === "delivered"
  }

  const { error } = await supabase.from("reviews").insert({
    reviewer_id: user.id,
    target_kind: targetKind,
    target_id: targetId,
    order_id: orderId,
    rating,
    body,
    is_verified_purchase: isVerifiedPurchase,
  })

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "You&apos;ve already reviewed this." }
    }
    return { ok: false, error: error.message }
  }

  revalidatePath("/")
  return { ok: true }
}
