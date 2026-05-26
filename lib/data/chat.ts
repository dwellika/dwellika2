import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { ProfileRow } from "./types"

export interface ChatRow {
  id: string
  kind: "direct" | "group" | "order"
  title: string | null
  order_id: string | null
  last_message_at: string | null
  created_at: string
}

export interface ChatMessageRow {
  id: string
  chat_id: string
  sender_id: string
  body: string | null
  attachments: Array<{ url: string; name: string; kind: "image" | "file" | "audio" }>
  voice_url: string | null
  is_edited: boolean
  is_deleted: boolean
  created_at: string
}

export interface ChatListItem {
  chat_id: string
  chat: ChatRow
  other: Pick<ProfileRow, "id" | "username" | "full_name" | "avatar_url"> | null
  last_message: { body: string | null; sender_id: string; created_at: string } | null
  unread: number
}

export async function listMyChats(userId: string): Promise<ChatListItem[]> {
  const supabase = await createClient()
  const { data: parts } = await supabase
    .from("chat_participants")
    .select(
      `
        chat_id, last_read_at,
        chat:chats!chat_participants_chat_id_fkey ( id, kind, title, order_id, last_message_at, created_at )
      `,
    )
    .eq("user_id", userId)

  const rows = (parts ?? []) as unknown as Array<{
    chat_id: string
    last_read_at: string | null
    chat: ChatRow
  }>
  if (rows.length === 0) return []

  // For each chat, get the other participant (for direct chats)
  const chatIds = rows.map((r) => r.chat_id)

  const [participantsRes, lastMsgRes] = await Promise.all([
    supabase
      .from("chat_participants")
      .select(
        `chat_id, user_id, profile:profiles!chat_participants_user_id_fkey ( id, username, full_name, avatar_url )`,
      )
      .in("chat_id", chatIds),
    supabase
      .from("chat_messages")
      .select("chat_id, sender_id, body, created_at")
      .in("chat_id", chatIds)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false }),
  ])

  const allParticipants =
    (participantsRes.data ?? []) as unknown as Array<{
      chat_id: string
      user_id: string
      profile: Pick<ProfileRow, "id" | "username" | "full_name" | "avatar_url"> | null
    }>
  const allMsgs =
    (lastMsgRes.data ?? []) as Array<{
      chat_id: string
      sender_id: string
      body: string | null
      created_at: string
    }>

  const lastByChat = new Map<string, (typeof allMsgs)[number]>()
  for (const m of allMsgs) {
    if (!lastByChat.has(m.chat_id)) lastByChat.set(m.chat_id, m)
  }

  const result: ChatListItem[] = rows.map((r) => {
    const others = allParticipants.filter(
      (p) => p.chat_id === r.chat_id && p.user_id !== userId,
    )
    const last = lastByChat.get(r.chat_id) ?? null
    const lastRead = r.last_read_at ? new Date(r.last_read_at).getTime() : 0
    const unread = allMsgs.filter(
      (m) =>
        m.chat_id === r.chat_id &&
        m.sender_id !== userId &&
        new Date(m.created_at).getTime() > lastRead,
    ).length
    return {
      chat_id: r.chat_id,
      chat: r.chat,
      other: others[0]?.profile ?? null,
      last_message: last,
      unread,
    }
  })

  result.sort((a, b) => {
    const at = a.last_message?.created_at ?? a.chat.created_at
    const bt = b.last_message?.created_at ?? b.chat.created_at
    return new Date(bt).getTime() - new Date(at).getTime()
  })

  return result
}

export async function getChat(chatId: string, userId: string) {
  const supabase = await createClient()
  const { data: participation } = await supabase
    .from("chat_participants")
    .select("chat_id")
    .eq("chat_id", chatId)
    .eq("user_id", userId)
    .maybeSingle()
  if (!participation) return null

  const { data: chat } = await supabase
    .from("chats")
    .select("id, kind, title, order_id, last_message_at, created_at")
    .eq("id", chatId)
    .maybeSingle()
  if (!chat) return null

  const { data: participants } = await supabase
    .from("chat_participants")
    .select(
      `user_id, last_read_at, profile:profiles!chat_participants_user_id_fkey ( id, username, full_name, avatar_url )`,
    )
    .eq("chat_id", chatId)

  return {
    chat: chat as unknown as ChatRow,
    participants:
      (participants ?? []) as unknown as Array<{
        user_id: string
        last_read_at: string | null
        profile: Pick<ProfileRow, "id" | "username" | "full_name" | "avatar_url"> | null
      }>,
  }
}

export async function listMessages(chatId: string, { limit = 100 } = {}) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("chat_messages")
    .select(
      "id, chat_id, sender_id, body, attachments, voice_url, is_edited, is_deleted, created_at",
    )
    .eq("chat_id", chatId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: true })
    .limit(limit)
  return (data ?? []) as unknown as ChatMessageRow[]
}
