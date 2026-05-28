"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { uploadChatAttachment } from "@/lib/storage/upload"

type ActionResult<T = void> = { ok: true; data?: T } | { ok: false; error: string }

async function getSessionUser() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not authenticated.")
  return session.user.id
}

export async function startDirectChat(otherUserId: string): Promise<ActionResult<{ chatId: string }>> {
  try {
    const userId = await getSessionUser()
    if (otherUserId === userId) return { ok: false, error: "Cannot DM yourself." }

    const myChats = await prisma.chatParticipant.findMany({
      where: { user_id: userId, chat: { kind: "direct", order_id: null } },
      select: { chat_id: true },
    })
    if (myChats.length > 0) {
      const existing = await prisma.chatParticipant.findFirst({
        where: { user_id: otherUserId, chat_id: { in: myChats.map((c) => c.chat_id) } },
        select: { chat_id: true },
      })
      if (existing) return { ok: true, data: { chatId: existing.chat_id } }
    }

    const chat = await prisma.chat.create({
      data: {
        kind: "direct",
        participants: {
          create: [{ user_id: userId }, { user_id: otherUserId }],
        },
      },
      select: { id: true },
    })

    return { ok: true, data: { chatId: chat.id } }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function startDirectChatAndRedirect(otherUserId: string) {
  const result = await startDirectChat(otherUserId)
  if (result.ok && result.data) redirect(`/messages/${result.data.chatId}`)
  return result
}

export async function getOrCreateOrderChat(orderId: string): Promise<ActionResult<{ chatId: string }>> {
  try {
    const userId = await getSessionUser()

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { buyer_id: true, order_items: { select: { seller_id: true } } },
    })
    if (!order) return { ok: false, error: "Order not found." }

    const sellerIds = [...new Set(order.order_items.map((i) => i.seller_id).filter(Boolean) as string[])]
    const isBuyer = order.buyer_id === userId
    const isSeller = sellerIds.includes(userId)
    if (!isBuyer && !isSeller) return { ok: false, error: "Not your order." }

    const existing = await prisma.chat.findFirst({ where: { kind: "order", order_id: orderId }, select: { id: true } })
    if (existing) {
      await prisma.chatParticipant.upsert({
        where: { chat_id_user_id: { chat_id: existing.id, user_id: userId } },
        create: { chat_id: existing.id, user_id: userId },
        update: {},
      })
      return { ok: true, data: { chatId: existing.id } }
    }

    const participants = [...new Set([order.buyer_id, ...sellerIds])]
    const chat = await prisma.chat.create({
      data: {
        kind: "order",
        order_id: orderId,
        title: "Order discussion",
        participants: { create: participants.map((uid) => ({ user_id: uid })) },
      },
      select: { id: true },
    })

    return { ok: true, data: { chatId: chat.id } }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function sendMessage(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await getSessionUser()
    const chatId = String(formData.get("chat_id") ?? "")
    const body = String(formData.get("body") ?? "").trim() || null
    if (!chatId) return { ok: false, error: "Missing chat." }

    const attachments: Array<{ url: string; name: string; kind: "image" | "file" | "audio" }> = []
    const files = formData.getAll("attachment") as File[]

    for (const f of files) {
      if (!f || !f.size) continue
      const result = await uploadChatAttachment(f, chatId, userId)
      attachments.push({
        url: result.url,
        name: f.name,
        kind: f.type.startsWith("image/") ? "image" : f.type.startsWith("audio/") ? "audio" : "file",
      })
    }

    if (!body && attachments.length === 0) return { ok: false, error: "Empty message." }

    await prisma.chatMessage.create({
      data: { chat_id: chatId, sender_id: userId, body, attachments },
    })

    const participants = await prisma.chatParticipant.findMany({
      where: { chat_id: chatId, user_id: { not: userId } },
      select: { user_id: true },
    })

    if (participants.length > 0) {
      const sender = await prisma.user.findUnique({ where: { id: userId }, select: { full_name: true, username: true } })
      const senderName = sender?.full_name ?? `@${sender?.username ?? "Someone"}`
      await prisma.notification.createMany({
        data: participants.map((p) => ({
          user_id: p.user_id,
          kind: "system" as const,
          title: `New message from ${senderName}`,
          body: body?.slice(0, 120) ?? "(attachment)",
          action_url: `/messages/${chatId}`,
          actor_id: userId,
        })),
      })
    }

    revalidatePath(`/messages/${chatId}`)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function markChatRead(chatId: string): Promise<ActionResult> {
  try {
    const userId = await getSessionUser()
    await prisma.chatParticipant.update({
      where: { chat_id_user_id: { chat_id: chatId, user_id: userId } },
      data: { last_read_at: new Date() },
    })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}
