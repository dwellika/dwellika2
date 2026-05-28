import "server-only"

import { prisma } from "@/lib/prisma"
import type { UserLevel } from "@/lib/types/database"

export interface UserLevelRow {
  user_id: string
  level: UserLevel
  xp: number
}

const THRESHOLDS: Record<UserLevel, { min: number; max: number }> = {
  explorer: { min: 0, max: 1000 },
  collector: { min: 1000, max: 5000 },
  patron: { min: 5000, max: 25000 },
  ambassador: { min: 25000, max: 100000 },
}

export interface LevelProgress {
  level: UserLevel
  xp: number
  next: UserLevel | null
  progress: number
  xpToNext: number | null
}

export function levelProgress(level: UserLevel, xp: number): LevelProgress {
  const t = THRESHOLDS[level]
  const span = t.max - t.min
  const progress = span > 0 ? Math.min(1, Math.max(0, (xp - t.min) / span)) : 1
  const order: UserLevel[] = ["explorer", "collector", "patron", "ambassador"]
  const idx = order.indexOf(level)
  const next = idx < order.length - 1 ? order[idx + 1] : null
  const xpToNext = next ? Math.max(0, t.max - xp) : null
  return { level, xp, next, progress, xpToNext }
}

export async function getMyLevel(userId: string): Promise<UserLevelRow> {
  const row = await prisma.userXp.findUnique({ where: { user_id: userId } })
  return row
    ? { user_id: row.user_id, level: row.level as UserLevel, xp: row.xp }
    : { user_id: userId, level: "explorer", xp: 0 }
}

export async function getUserBadges(userId: string) {
  return prisma.userBadge.findMany({
    where: { user_id: userId },
    include: {
      badge: { select: { slug: true, name: true, description: true, icon_url: true, tier: true } },
    },
    orderBy: { awarded_at: "desc" },
  })
}
