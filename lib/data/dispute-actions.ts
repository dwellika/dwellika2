"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { uploadFile } from "@/lib/storage/upload"

type ActionResult<T = void> = { ok: true; data?: T } | { ok: false; error: string }

export async function openDispute(formData: FormData): Promise<ActionResult | void> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." }
  const userId = session.user.id

  const orderId = String(formData.get("order_id") ?? "")
  const reason = String(formData.get("reason") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim() || null

  if (!orderId || !reason) return { ok: false, error: "Missing order or reason." }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { buyer_id: true, order_items: { select: { seller_id: true } } },
  })
  if (!order) return { ok: false, error: "Order not found." }
  if (order.buyer_id !== userId) return { ok: false, error: "Only the buyer can open a dispute." }

  const sellerId = order.order_items.find((i) => i.seller_id)?.seller_id
  if (!sellerId) return { ok: false, error: "No seller for this order." }

  const evidence: Array<{ url: string; name: string }> = []
  for (const f of formData.getAll("evidence") as File[]) {
    if (!f || !f.size) continue
    const result = await uploadFile(f, { folder: `dwellika/disputes/${userId}`, resourceType: "auto" })
    evidence.push({ url: result.url, name: f.name })
  }

  const dispute = await prisma.dispute.create({
    data: { order_id: orderId, opened_by: userId, against_id: sellerId, reason, description, evidence, status: "open" },
    select: { id: true },
  })

  await prisma.notification.create({
    data: {
      user_id: sellerId,
      kind: "system",
      title: "A dispute was opened on one of your orders",
      body: reason,
      action_url: `/disputes/${dispute.id}`,
    },
  })

  revalidatePath("/disputes")
  redirect(`/disputes/${dispute.id}`)
}

export async function postDisputeMessage(disputeId: string, body: string): Promise<ActionResult> {
  try {
    if (!body.trim()) return { ok: false, error: "Empty message." }
    const session = await auth()
    if (!session?.user?.id) return { ok: false, error: "Not authenticated." }
    await prisma.disputeMessage.create({
      data: { dispute_id: disputeId, sender_id: session.user.id, body: body.trim() },
    })
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
    const session = await auth()
    if (!session?.user?.id) return { ok: false, error: "Not authenticated." }
    const role = session.user.role ?? "user"
    if (role !== "admin" && role !== "super_admin") return { ok: false, error: "Admins only." }

    const dispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: { status: outcome, resolution, resolved_by: session.user.id, resolved_at: new Date() },
      select: { opened_by: true, against_id: true },
    })

    await prisma.notification.createMany({
      data: [
        { user_id: dispute.opened_by, kind: "system", title: `Dispute ${outcome}`, body: resolution, action_url: `/disputes/${disputeId}` },
        { user_id: dispute.against_id, kind: "system", title: `Dispute ${outcome}`, body: resolution, action_url: `/disputes/${disputeId}` },
      ],
    })

    revalidatePath(`/disputes/${disputeId}`)
    revalidatePath("/admin/disputes")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}
