import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { ReviewTarget } from "@/lib/types/database"
import type { ProfileRow, ReviewRow } from "./types"

export type ReviewWithReviewer = ReviewRow & {
  reviewer: Pick<ProfileRow, "id" | "username" | "full_name" | "avatar_url"> | null
}

export async function listReviews(target: { kind: ReviewTarget; id: string }, limit = 12) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("reviews")
    .select(
      `
        id, reviewer_id, target_kind, target_id, order_id, rating, body, images,
        is_verified_purchase, is_hidden, helpful_count, created_at,
        reviewer:profiles!reviews_reviewer_id_fkey ( id, username, full_name, avatar_url )
      `,
    )
    .eq("target_kind", target.kind)
    .eq("target_id", target.id)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(limit)
  return (data ?? []) as unknown as ReviewWithReviewer[]
}

export async function reviewSummary(target: { kind: ReviewTarget; id: string }) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("reviews")
    .select("rating")
    .eq("target_kind", target.kind)
    .eq("target_id", target.id)
    .eq("is_hidden", false)
  const ratings = (data ?? []).map((r) => (r as { rating: number }).rating)
  if (!ratings.length) return { count: 0, average: 0, distribution: [0, 0, 0, 0, 0] }
  const distribution = [0, 0, 0, 0, 0]
  for (const r of ratings) distribution[Math.max(1, Math.min(5, r)) - 1]++
  return {
    count: ratings.length,
    average: ratings.reduce((a, b) => a + b, 0) / ratings.length,
    distribution,
  }
}
