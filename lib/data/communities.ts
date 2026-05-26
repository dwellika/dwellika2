import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { ProfileRow } from "./types"
import type { CommunityRole } from "@/lib/types/database"

export interface CommunityRow {
  id: string
  slug: string
  name: string
  description: string | null
  cover_url: string | null
  category: string | null
  is_private: boolean
  created_by: string | null
  member_count: number
  created_at: string
}

export interface CommunityPostRow {
  id: string
  community_id: string
  author_id: string
  title: string | null
  body: string | null
  media: Array<{ url: string; kind: "image" | "video" }>
  status: string
  like_count: number
  comment_count: number
  created_at: string
  author?: Pick<ProfileRow, "id" | "username" | "full_name" | "avatar_url"> | null
}

export interface PollRow {
  id: string
  post_id: string
  question: string
  closes_at: string | null
  poll_options: Array<{ id: string; label: string; position: number }>
}

export async function listCommunities({
  q,
  category,
  limit = 24,
  offset = 0,
}: {
  q?: string
  category?: string
  limit?: number
  offset?: number
} = {}) {
  const supabase = await createClient()
  let query = supabase
    .from("communities")
    .select(
      "id, slug, name, description, cover_url, category, is_private, created_by, member_count, created_at",
      { count: "exact" },
    )
    .order("member_count", { ascending: false })

  if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`)
  if (category) query = query.eq("category", category)

  const { data, count } = await query.range(offset, offset + limit - 1)
  return {
    communities: (data ?? []) as unknown as CommunityRow[],
    count: count ?? 0,
  }
}

export async function getCommunityBySlug(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("communities")
    .select(
      "id, slug, name, description, cover_url, category, is_private, created_by, member_count, created_at",
    )
    .eq("slug", slug)
    .maybeSingle()
  return data as unknown as CommunityRow | null
}

export async function getMembership(communityId: string, userId: string | undefined) {
  if (!userId) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from("community_members")
    .select("role")
    .eq("community_id", communityId)
    .eq("user_id", userId)
    .maybeSingle()
  return (data as { role: CommunityRole } | null)?.role ?? null
}

export async function listCommunityPosts(
  communityId: string,
  { limit = 30, offset = 0 } = {},
) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("community_posts")
    .select(
      `
        id, community_id, author_id, title, body, media, status,
        like_count, comment_count, created_at,
        author:profiles!community_posts_author_id_fkey ( id, username, full_name, avatar_url )
      `,
    )
    .eq("community_id", communityId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)
  return (data ?? []) as unknown as CommunityPostRow[]
}

export async function getPollForPost(postId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("polls")
    .select(`id, post_id, question, closes_at, poll_options ( id, label, position )`)
    .eq("post_id", postId)
    .maybeSingle()
  return data as unknown as PollRow | null
}

export async function getPollTallies(pollId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("poll_votes")
    .select("option_id")
    .eq("poll_id", pollId)
  const counts: Record<string, number> = {}
  for (const v of (data ?? []) as { option_id: string }[]) {
    counts[v.option_id] = (counts[v.option_id] ?? 0) + 1
  }
  return counts
}

export async function getMyPollVote(pollId: string, userId: string | undefined) {
  if (!userId) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from("poll_votes")
    .select("option_id")
    .eq("poll_id", pollId)
    .eq("user_id", userId)
    .maybeSingle()
  return (data as { option_id: string } | null)?.option_id ?? null
}
