import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { ArtworkWithMedia } from "./types"

export interface ArtworkListParams {
  q?: string
  artistId?: string
  mediums?: string[]
  tags?: string[]
  forSaleOnly?: boolean
  minPrice?: number
  maxPrice?: number
  sort?: "newest" | "popular" | "price_asc" | "price_desc"
  limit?: number
  offset?: number
  status?: "approved" | "pending" | "draft" | "all"
}

export async function listArtworks({
  q,
  artistId,
  mediums,
  tags,
  forSaleOnly,
  minPrice,
  maxPrice,
  sort = "newest",
  limit = 24,
  offset = 0,
  status = "approved",
}: ArtworkListParams = {}) {
  const supabase = await createClient()

  let query = supabase
    .from("artworks")
    .select(
      `
        id, artist_id, title, slug, description, medium, style, subject,
        dimensions, prints_available, custom_size_option, for_sale, price,
        currency, edition_size, status, tags, view_count, like_count,
        save_count, published_at, created_at, updated_at, ai_tags,
        artwork_media ( id, artwork_id, kind, url, thumbnail_url, width, height, position, is_primary, created_at ),
        artist:profiles!artworks_artist_id_fkey ( id, username, full_name, avatar_url )
      `,
      { count: "exact" },
    )

  if (status !== "all") query = query.eq("status", status)
  if (artistId) query = query.eq("artist_id", artistId)
  if (forSaleOnly) query = query.eq("for_sale", true)
  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
  }
  if (mediums && mediums.length) {
    query = query.in("medium", mediums)
  }
  if (tags && tags.length) {
    query = query.overlaps("tags", tags)
  }
  if (typeof minPrice === "number") query = query.gte("price", minPrice)
  if (typeof maxPrice === "number") query = query.lte("price", maxPrice)

  switch (sort) {
    case "popular":
      query = query.order("like_count", { ascending: false })
      break
    case "price_asc":
      query = query.order("price", { ascending: true, nullsFirst: false })
      break
    case "price_desc":
      query = query.order("price", { ascending: false, nullsFirst: false })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  const { data, count, error } = await query.range(offset, offset + limit - 1)
  if (error) return { artworks: [] as ArtworkWithMedia[], count: 0, error }
  return {
    artworks: (data ?? []) as unknown as ArtworkWithMedia[],
    count: count ?? 0,
    error: null,
  }
}

export interface ArtworkDetail extends ArtworkWithMedia {
  artist: {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
    bio: string | null
    is_verified: boolean
  }
}

export async function getArtworkBySlug(
  artistUsername: string,
  slug: string,
): Promise<ArtworkDetail | null> {
  const supabase = await createClient()
  const { data: artist } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, bio, is_verified")
    .eq("username", artistUsername)
    .maybeSingle()

  if (!artist) return null
  const artistRow = artist as unknown as ArtworkDetail["artist"]

  const { data: artwork } = await supabase
    .from("artworks")
    .select(
      `
        id, artist_id, title, slug, description, medium, style, subject,
        dimensions, prints_available, custom_size_option, for_sale, price,
        currency, edition_size, status, tags, view_count, like_count,
        save_count, published_at, created_at, updated_at, ai_tags,
        artwork_media ( id, artwork_id, kind, url, thumbnail_url, width, height, position, is_primary, created_at )
      `,
    )
    .eq("artist_id", artistRow.id)
    .eq("slug", slug)
    .maybeSingle()

  if (!artwork) return null
  return {
    ...(artwork as unknown as ArtworkWithMedia),
    artist: artistRow,
  }
}

export async function listSimilarArtworks(artworkId: string, mediumOrTags: { medium?: string | null; tags?: string[] }, limit = 6) {
  const supabase = await createClient()
  let query = supabase
    .from("artworks")
    .select(
      `id, artist_id, title, slug, medium, price, currency, for_sale,
       artwork_media ( url, thumbnail_url, is_primary )`,
    )
    .eq("status", "approved")
    .neq("id", artworkId)
    .limit(limit)

  if (mediumOrTags.medium) {
    query = query.eq("medium", mediumOrTags.medium)
  }

  const { data } = await query.order("like_count", { ascending: false })
  return (data ?? []) as unknown as ArtworkWithMedia[]
}

export async function incrementArtworkView(artworkId: string) {
  const supabase = await createClient()
  await supabase.rpc("increment_view", { p_artwork_id: artworkId }).throwOnError().single().then(
    () => {},
    () => {
      // ignore — function may not exist yet (defined in optional migration)
    },
  )
  return supabase
    .from("artworks")
    .update({ view_count: undefined })
    .eq("id", artworkId)
}
