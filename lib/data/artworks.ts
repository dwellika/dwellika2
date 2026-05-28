import "server-only"
import { cache } from "react"

import { prisma } from "@/lib/prisma"

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
        artwork_media: { orderBy: { position: "asc" } },
        artist: { select: { id: true, username: true, full_name: true, avatar_url: true } },
      },
      orderBy,
      take: limit,
      skip: offset,
    }),
    prisma.artwork.count({ where }),
  ])

  return { artworks, count, error: null }
}

export const getArtworkBySlug = cache(async function _getArtworkBySlug(
  artistUsername: string,
  slug: string,
) {
  return prisma.artwork.findFirst({
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
})

export async function listSimilarArtworks(
  artworkId: string,
  mediumOrTags: { medium?: string | null; tags?: string[] },
  limit = 6,
) {
  return prisma.artwork.findMany({
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
}

export async function incrementArtworkView(artworkId: string) {
  await prisma.artwork.update({
    where: { id: artworkId },
    data: { view_count: { increment: 1 } },
  }).catch(() => {})
}
