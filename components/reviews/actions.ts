"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import type { ReviewTarget } from "@/lib/types/database"

type ActionResult = { ok: true } | { ok: false; error: string }

export async function submitReview(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Sign in to leave a review." }
  const userId = session.user.id

  const targetKind = String(formData.get("targetKind") ?? "") as ReviewTarget
  const targetId = String(formData.get("targetId") ?? "")
  const orderId = (formData.get("orderId") as string) || null
  const rating = Number(formData.get("rating") ?? 0)
  const body = String(formData.get("body") ?? "").trim() || null

  if (!targetKind || !targetId) return { ok: false, error: "Missing review target." }
  if (rating < 1 || rating > 5) return { ok: false, error: "Pick a rating from 1 to 5." }

  let isVerifiedPurchase = false
  if (orderId) {
    const ord = await prisma.order.findUnique({
      where: { id: orderId },
      select: { buyer_id: true, status: true },
    })
    isVerifiedPurchase = ord?.buyer_id === userId && ord?.status === "delivered"
  }

  try {
    await prisma.review.create({
      data: {
        reviewer_id: userId,
        target_kind: targetKind,
        target_id: targetId,
        order_id: orderId,
        rating,
        body,
        is_verified_purchase: isVerifiedPurchase,
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ""
    if (msg.includes("Unique constraint")) {
      return { ok: false, error: "You've already reviewed this." }
    }
    return { ok: false, error: msg || "Failed to submit review." }
  }

  revalidatePath("/")
  return { ok: true }
}
