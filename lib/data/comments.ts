import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { ReactionTarget } from "@/lib/types/database"
import type { ProfileRow } from "./types"

export interface CommentRow {
  id: string
  user_id: string
  target_kind: ReactionTarget
  target_id: string
  parent_id: string | null
  body: string
  is_edited: boolean
  is_hidden: boolean
  like_count: number
  created_at: string
  author?: Pick<ProfileRow, "id" | "username" | "full_name" | "avatar_url"> | null
}

export async function listCommentsFor(
  target: { kind: ReactionTarget; id: string },
  { limit = 50 } = {},
) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("comments")
    .select(
      `
        id, user_id, target_kind, target_id, parent_id, body, is_edited, is_hidden,
        like_count, created_at,
        author:profiles!comments_user_id_fkey ( id, username, full_name, avatar_url )
      `,
    )
    .eq("target_kind", target.kind)
    .eq("target_id", target.id)
    .eq("is_hidden", false)
    .order("created_at", { ascending: true })
    .limit(limit)
  return (data ?? []) as unknown as CommentRow[]
}
