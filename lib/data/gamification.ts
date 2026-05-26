import "server-only"

import { createClient } from "@/lib/supabase/server"
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
  progress: number // 0..1
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

export async function getMyLevel(userId: string): Promise<UserLevelRow | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("user_levels")
    .select("user_id, level, xp")
    .eq("user_id", userId)
    .maybeSingle()
  return (data as UserLevelRow | null) ?? { user_id: userId, level: "explorer", xp: 0 }
}

export async function getUserBadges(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("user_badges")
    .select(`badge:badges(slug, name, description, icon_url, tier), awarded_at`)
    .eq("user_id", userId)
  return (data ?? []) as unknown as Array<{
    badge: { slug: string; name: string; description: string | null; icon_url: string | null; tier: string | null } | null
    awarded_at: string
  }>
}
