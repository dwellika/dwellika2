import "server-only"

import { prisma } from "@/lib/prisma"

export async function listNotifications(userId: string, { limit = 30 } = {}) {
  return prisma.notification.findMany({
    where: { user_id: userId },
    include: {
      actor: { select: { username: true, full_name: true, avatar_url: true } },
    },
    orderBy: { created_at: "desc" },
    take: limit,
  })
}

export async function unreadCount(userId: string) {
  return prisma.notification.count({
    where: { user_id: userId, read_at: null },
  })
}
