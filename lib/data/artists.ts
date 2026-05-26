import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { ArtistCardRow } from "./types"

export interface ArtistListParams {
  q?: string
  mediums?: string[]
  styles?: string[]
  limit?: number
  offset?: number
  sort?: "newest" | "followers" | "works"
}

export async function listArtists({
  q,
  mediums,
  styles,
  limit = 24,
  offset = 0,
  sort = "newest",
}: ArtistListParams = {}) {
  const supabase = await createClient()

  let query = supabase
    .from("profiles")
    .select(
      `
        id, username, full_name, avatar_url, cover_url, bio, is_verified, location,
        artist_profiles!inner ( tier, specialty, styles, mediums, is_verified )
      `,
      { count: "exact" },
    )
    .eq("role", "artist")

  if (q) {
    query = query.or(
      `username.ilike.%${q}%,full_name.ilike.%${q}%,bio.ilike.%${q}%`,
    )
  }
  if (mediums && mediums.length) {
    query = query.contains("artist_profiles.mediums", mediums)
  }
  if (styles && styles.length) {
    query = query.contains("artist_profiles.styles", styles)
  }

  if (sort === "newest") {
    query = query.order("created_at", { ascending: false })
  }

  const { data, count, error } = await query.range(offset, offset + limit - 1)
  if (error) return { artists: [] as ArtistCardRow[], count: 0, error }

  return {
    artists: (data ?? []) as unknown as ArtistCardRow[],
    count: count ?? 0,
    error: null,
  }
}

export async function getProfileByUsername(username: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("profiles")
    .select(
      `
        id, role, username, full_name, avatar_url, cover_url, bio, website,
        socials, location, interests, is_verified, created_at,
        artist_profiles ( tier, specialty, styles, mediums, is_verified, stats )
      `,
    )
    .eq("username", username)
    .maybeSingle()

  return data as
    | (ArtistCardRow & { website: string | null; socials: Record<string, string>; interests: string[]; created_at: string; role: string })
    | null
}

export async function getFollowCounts(userId: string) {
  const supabase = await createClient()
  const [followers, following] = await Promise.all([
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId),
  ])
  return {
    followers: followers.count ?? 0,
    following: following.count ?? 0,
  }
}

export async function isFollowing(viewerId: string | undefined, targetId: string) {
  if (!viewerId || viewerId === targetId) return false
  const supabase = await createClient()
  const { count } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", viewerId)
    .eq("following_id", targetId)
  return (count ?? 0) > 0
}
