import "server-only"

import { prisma } from "@/lib/prisma"

export interface ChatMessageRow {
  id: string
  chat_id: string
  sender_id: string
  body: string | null
  attachments: Array<{ url: string; name: string; kind: "image" | "file" | "audio" }>
  voice_url: string | null
  is_edited: boolean
  is_deleted: boolean
  created_at: Date
}

export async function listMyChats(userId: string) {
  const participations = await prisma.chatParticipant.findMany({
    where: { user_id: userId },
    include: {
      chat: {
        include: {
          participants: {
            include: {
              user: { select: { id: true, username: true, full_name: true, avatar_url: true } },
            },
          },
          messages: {
            where: { is_deleted: false },
            orderBy: { created_at: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { chat: { last_message_at: "desc" } },
  })

  return participations.map((p) => {
    const lastRead = p.last_read_at?.getTime() ?? 0
    const others = p.chat.participants.filter((cp) => cp.user_id !== userId)
    const lastMsg = p.chat.messages[0] ?? null

    const unread = p.chat.messages.filter(
      (m) => m.sender_id !== userId && m.created_at.getTime() > lastRead,
    ).length

    return {
      chat_id: p.chat_id,
      chat: p.chat,
      other: others[0]?.user ?? null,
      last_message: lastMsg,
      unread,
    }
  })
}

export async function getChat(chatId: string, userId: string) {
  const participation = await prisma.chatParticipant.findUnique({
    where: { chat_id_user_id: { chat_id: chatId, user_id: userId } },
  })
  if (!participation) return null

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      participants: {
        include: {
          user: { select: { id: true, username: true, full_name: true, avatar_url: true } },
        },
      },
    },
  })
  if (!chat) return null

  return { chat, participants: chat.participants }
}

export async function listMessages(chatId: string, { limit = 100 } = {}) {
  return prisma.chatMessage.findMany({
    where: { chat_id: chatId, is_deleted: false },
    orderBy: { created_at: "asc" },
    take: limit,
  }) as Promise<ChatMessageRow[]>
}
