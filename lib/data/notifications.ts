import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { NotificationRow } from "./types"

export async function listNotifications(userId: string, { limit = 30 } = {}) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("notifications")
    .select(
      `
        id, user_id, kind, title, body, payload, action_url, actor_id, read_at, created_at,
        actor:profiles!notifications_actor_id_fkey ( username, full_name, avatar_url )
      `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)
  return (data ?? []) as unknown as Array<
    NotificationRow & {
      actor: { username: string | null; full_name: string | null; avatar_url: string | null } | null
    }
  >
}

export async function unreadCount(userId: string) {
  const supabase = await createClient()
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null)
  return count ?? 0
}
