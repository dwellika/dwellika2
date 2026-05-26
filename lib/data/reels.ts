import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { ProfileRow, ReelRow } from "./types"

export type ReelWithCreator = ReelRow & {
  creator: Pick<ProfileRow, "id" | "username" | "full_name" | "avatar_url"> | null
  artwork?: { slug: string; price: number | null; for_sale: boolean } | null
  product?: { slug: string; price: number } | null
}

export async function listReels({
  limit = 12,
  offset = 0,
  creatorId,
}: { limit?: number; offset?: number; creatorId?: string } = {}) {
  const supabase = await createClient()
  let query = supabase
    .from("reels")
    .select(
      `
        id, creator_id, video_url, thumbnail_url, caption, duration_sec, width, height,
        artwork_id, product_id, tags, status, view_count, like_count, comment_count,
        share_count, published_at, created_at,
        creator:profiles!reels_creator_id_fkey ( id, username, full_name, avatar_url ),
        artwork:artworks!reels_artwork_id_fkey ( slug, price, for_sale ),
        product:products!reels_product_id_fkey ( slug, price )
      `,
    )
    .eq("status", "approved")
    .order("published_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1)

  if (creatorId) query = query.eq("creator_id", creatorId)

  const { data } = await query
  return (data ?? []) as unknown as ReelWithCreator[]
}
