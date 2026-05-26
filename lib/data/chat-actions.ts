"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

type ActionResult<T = void> = { ok: true; data?: T } | { ok: false; error: string }

export async function startDirectChat(
  otherUserId: string,
): Promise<ActionResult<{ chatId: string }>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: "Not authenticated." }
    if (otherUserId === user.id) return { ok: false, error: "Cannot DM yourself." }

    // Find existing direct chat between the two
    const { data: mine } = await supabase
      .from("chat_participants")
      .select("chat_id, chat:chats!chat_participants_chat_id_fkey(kind, order_id)")
      .eq("user_id", user.id)

    const myDirectChats =
      ((mine ?? []) as unknown as Array<{
        chat_id: string
        chat: { kind: string; order_id: string | null } | null
      }>).filter((r) => r.chat?.kind === "direct" && !r.chat?.order_id)

    if (myDirectChats.length > 0) {
      const { data: theirs } = await supabase
        .from("chat_participants")
        .select("chat_id")
        .in("chat_id", myDirectChats.map((c) => c.chat_id))
        .eq("user_id", otherUserId)
      const match = (theirs ?? [])[0] as { chat_id: string } | undefined
      if (match) return { ok: true, data: { chatId: match.chat_id } }
    }

    // Create a new direct chat via admin (RLS would need both participants
    // to exist before the policy could pass; service role is the clean path)
    const admin = createAdminClient()
    const { data: chat, error } = await admin
      .from("chats")
      .insert({ kind: "direct" })
      .select("id")
      .single()
    if (error || !chat) return { ok: false, error: error?.message ?? "Failed." }
    const chatId = (chat as { id: string }).id

    await admin.from("chat_participants").insert([
      { chat_id: chatId, user_id: user.id },
      { chat_id: chatId, user_id: otherUserId },
    ])

    return { ok: true, data: { chatId } }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function startDirectChatAndRedirect(otherUserId: string) {
  const result = await startDirectChat(otherUserId)
  if (result.ok && result.data) {
    redirect(`/messages/${result.data.chatId}`)
  }
  return result
}

export async function getOrCreateOrderChat(
  orderId: string,
): Promise<ActionResult<{ chatId: string }>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: "Not authenticated." }

    // Permission: buyer of the order or seller on any item
    const { data: order } = await supabase
      .from("orders")
      .select("id, buyer_id, order_items(seller_id)")
      .eq("id", orderId)
      .maybeSingle()
    const orderRow = order as
      | { id: string; buyer_id: string; order_items: { seller_id: string | null }[] }
      | null
    if (!orderRow) return { ok: false, error: "Order not found." }

    const sellerIds = Array.from(
      new Set((orderRow.order_items ?? []).map((i) => i.seller_id).filter(Boolean) as string[]),
    )
    const isBuyer = orderRow.buyer_id === user.id
    const isSeller = sellerIds.includes(user.id)
    if (!isBuyer && !isSeller) return { ok: false, error: "Not your order." }

    // Find existing order chat
    const { data: existing } = await supabase
      .from("chats")
      .select("id")
      .eq("kind", "order")
      .eq("order_id", orderId)
      .maybeSingle()
    if (existing) {
      const id = (existing as { id: string }).id
      // Ensure caller is a participant
      const admin = createAdminClient()
      await admin
        .from("chat_participants")
        .upsert(
          { chat_id: id, user_id: user.id },
          { onConflict: "chat_id,user_id" },
        )
      return { ok: true, data: { chatId: id } }
    }

    const admin = createAdminClient()
    const { data: chat, error } = await admin
      .from("chats")
      .insert({ kind: "order", order_id: orderId, title: "Order discussion" })
      .select("id")
      .single()
    if (error || !chat) return { ok: false, error: error?.message ?? "Failed." }
    const chatId = (chat as { id: string }).id

    const participants = Array.from(new Set([orderRow.buyer_id, ...sellerIds]))
    await admin
      .from("chat_participants")
      .insert(participants.map((uid) => ({ chat_id: chatId, user_id: uid })))

    return { ok: true, data: { chatId } }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function sendMessage(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: "Not authenticated." }

    const chatId = String(formData.get("chat_id") ?? "")
    const body = String(formData.get("body") ?? "").trim() || null
    if (!chatId) return { ok: false, error: "Missing chat." }

    const attachments: Array<{ url: string; name: string; kind: "image" | "file" | "audio" }> = []
    const files = formData.getAll("attachment") as File[]
    for (const f of files) {
      if (!f || !f.size) continue
      const ext = (f.name.split(".").pop() ?? "bin").toLowerCase()
      const path = `${chatId}/${user.id}/${Date.now()}-${f.name}`
      const { error: upErr } = await supabase.storage
        .from("chat")
        .upload(path, f, { contentType: f.type, upsert: false })
      if (upErr) return { ok: false, error: upErr.message }
      // For private bucket, signed URL on demand. For simplicity, signed URL valid 7 days.
      const { data: signed } = await supabase.storage
        .from("chat")
        .createSignedUrl(path, 60 * 60 * 24 * 7)
      attachments.push({
        url: signed?.signedUrl ?? "",
        name: f.name,
        kind: f.type.startsWith("image/")
          ? "image"
          : f.type.startsWith("audio/")
            ? "audio"
            : "file",
      })
      void ext
    }

    if (!body && attachments.length === 0) {
      return { ok: false, error: "Empty message." }
    }

    await supabase.from("chat_messages").insert({
      chat_id: chatId,
      sender_id: user.id,
      body,
      attachments,
    })

    // Notify other participants (excluding sender)
    const { data: participants } = await supabase
      .from("chat_participants")
      .select("user_id, profile:profiles!chat_participants_user_id_fkey(username, full_name)")
      .eq("chat_id", chatId)

    const admin = createAdminClient()
    const others =
      ((participants ?? []) as unknown as Array<{
        user_id: string
        profile: { username: string | null; full_name: string | null } | null
      }>).filter((p) => p.user_id !== user.id)

    if (others.length > 0) {
      const { data: senderProfile } = await supabase
        .from("profiles")
        .select("username, full_name")
        .eq("id", user.id)
        .maybeSingle()
      const senderName =
        (senderProfile as { username?: string; full_name?: string } | null)?.full_name ??
        `@${(senderProfile as { username?: string } | null)?.username}`
      await admin.from("notifications").insert(
        others.map((p) => ({
          user_id: p.user_id,
          kind: "system" as const,
          title: `New message from ${senderName}`,
          body: body?.slice(0, 120) ?? "(attachment)",
          action_url: `/messages/${chatId}`,
          actor_id: user.id,
        })),
      )
    }

    revalidatePath(`/messages/${chatId}`)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function markChatRead(chatId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: "Not authenticated." }
    await supabase
      .from("chat_participants")
      .update({ last_read_at: new Date().toISOString() })
      .eq("chat_id", chatId)
      .eq("user_id", user.id)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}
