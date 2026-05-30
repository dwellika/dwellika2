import "server-only"

import { prisma } from "@/lib/prisma"

const NOTIFICATION_TTL_DAYS = 5

/** Silently delete notifications older than 5 days for this user. */
async function pruneOldNotifications(userId: string) {
  const cutoff = new Date(Date.now() - NOTIFICATION_TTL_DAYS * 24 * 60 * 60 * 1000)
  await prisma.notification
    .deleteMany({ where: { user_id: userId, created_at: { lt: cutoff } } })
    .catch(() => {})
}

export async function listNotifications(userId: string, { limit = 30 } = {}) {
  // Prune stale entries lazily — fire-and-forget, doesn't block the response
  pruneOldNotifications(userId)

  return prisma.notification.findMany({
    where:   { user_id: userId },
    include: { actor: { select: { username: true, full_name: true, avatar_url: true } } },
    orderBy: { created_at: "desc" },
    take:    limit,
  })
}

export async function unreadCount(userId: string) {
  return prisma.notification.count({
    where: { user_id: userId, read_at: null },
  })
}
