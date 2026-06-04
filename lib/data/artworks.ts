import "server-only"
import { cache } from "react"
import { unstable_cache } from "next/cache"

import { prisma } from "@/lib/prisma"

// Prisma Decimal can't be serialised to a Client Component — coerce the artwork
// price to a plain number before returning.
function serializeArtwork<T extends { price: unknown }>(a: T) {
  return { ...a, price: a.price == null ? null : Number(a.price) }
}

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

/**
 * Each unique params object gets its own cache entry.
 * We include a stable JSON key so undefined-vs-absent keys don't collide.
 */
export function listArtworks(params: ArtworkListParams = {}) {
  const key = JSON.stringify(params, Object.keys(params).sort())
  return unstable_cache(
    () => _listArtworksImpl(params),
    ["list-artworks", key],
    { revalidate: 60, tags: ["artworks"] },
  )()
}

async function _listArtworksImpl({
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
  const where = {
    ...(status !== "all" ? { status } : {}),
    ...(artistId ? { artist_id: artistId } : {}),
    ...(forSaleOnly ? { for_sale: true } : {}),
    ...(mediums?.length ? { medium: { in: mediums } } : {}),
    ...(tags?.length ? { tags: { hasSome: tags } } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(typeof minPrice === "number" ? { price: { gte: minPrice } } : {}),
    ...(typeof maxPrice === "number" ? { price: { ...(typeof minPrice === "number" ? { gte: minPrice } : {}), lte: maxPrice } } : {}),
  }

  const orderBy =
    sort === "popular"
      ? { like_count: "desc" as const }
      : sort === "price_asc"
        ? { price: "asc" as const }
        : sort === "price_desc"
          ? { price: "desc" as const }
          : { created_at: "desc" as const }

  const [artworks, count] = await prisma.$transaction([
    prisma.artwork.findMany({
      where,
      include: {
        // Only fetch the first (primary) media item for listing thumbnails
        artwork_media: { orderBy: { position: "asc" }, take: 1 },
        artist: { select: { id: true, username: true, full_name: true, avatar_url: true } },
      },
      orderBy,
      take: limit,
      skip: offset,
    }),
    prisma.artwork.count({ where }),
  ])

  return { artworks: artworks.map(serializeArtwork), count, error: null }
}

export const getArtworkBySlug = cache(async function _getArtworkBySlug(
  artistUsername: string,
  slug: string,
) {
  const artwork = await prisma.artwork.findFirst({
    where: { artist: { username: artistUsername }, slug, status: "approved" },
    include: {
      artwork_media: { orderBy: { position: "asc" } },
      artist: {
        select: {
          id: true,
          username: true,
          full_name: true,
          avatar_url: true,
          bio: true,
          is_verified: true,
        },
      },
    },
  })
  return artwork ? serializeArtwork(artwork) : null
})

export async function listSimilarArtworks(
  artworkId: string,
  mediumOrTags: { medium?: string | null; tags?: string[] },
  limit = 6,
) {
  const similar = await prisma.artwork.findMany({
    where: {
      id: { not: artworkId },
      status: "approved",
      ...(mediumOrTags.medium ? { medium: mediumOrTags.medium } : {}),
    },
    include: {
      artwork_media: { orderBy: { position: "asc" }, take: 1 },
    },
    orderBy: { like_count: "desc" },
    take: limit,
  })
  return similar.map(serializeArtwork)
}

export async function incrementArtworkView(artworkId: string) {
  await prisma.artwork.update({
    where: { id: artworkId },
    data: { view_count: { increment: 1 } },
  }).catch(() => {})
}
