import "server-only"
import { cache } from "react"
import { prisma } from "@/lib/prisma"

const reelSelect = {
  id: true,
  creator_id: true,
  video_url: true,
  thumbnail_url: true,
  caption: true,
  duration_sec: true,
  width: true,
  height: true,
  artwork_id: true,
  product_id: true,
  tags: true,
  status: true,
  view_count: true,
  like_count: true,
  comment_count: true,
  share_count: true,
  published_at: true,
  created_at: true,
  creator: {
    select: {
      id: true,
      username: true,
      full_name: true,
      avatar_url: true,
      is_verified: true,
    },
  },
  artwork: {
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      currency: true,
      for_sale: true,
    },
  },
  product: {
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      currency: true,
    },
  },
} as const

export type ReelWithCreator = {
  id: string
  creator_id: string
  video_url: string
  thumbnail_url: string | null
  caption: string | null
  duration_sec: number | null
  width: number | null
  height: number | null
  artwork_id: string | null
  product_id: string | null
  tags: string[]
  status: string
  view_count: number
  like_count: number
  comment_count: number
  share_count: number
  published_at: Date | null
  created_at: Date
  creator: {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
    is_verified: boolean
  } | null
  artwork: {
    id: string
    slug: string
    title: string
    price: unknown
    currency: string
    for_sale: boolean
  } | null
  product: {
    id: string
    slug: string
    title: string
    price: unknown
    currency: string
  } | null
  _isTrending?: boolean
  _isRecommended?: boolean
}

export async function listReels({
  limit = 12,
  offset = 0,
  creatorId,
  ids,
}: {
  limit?: number
  offset?: number
  creatorId?: string
  ids?: string[]
} = {}): Promise<ReelWithCreator[]> {
  const rows = await prisma.reel.findMany({
    where: {
      status: "approved",
      ...(creatorId ? { creator_id: creatorId } : {}),
      ...(ids ? { id: { in: ids } } : {}),
    },
    select: reelSelect,
    orderBy: ids ? undefined : { published_at: "desc" },
    take: ids ? undefined : limit,
    skip: ids ? undefined : offset,
  })

  // Preserve order from `ids` array when provided
  if (ids) {
    const map = new Map(rows.map((r: any) => [r.id, r]))
    return ids.map((id) => map.get(id)).filter(Boolean) as ReelWithCreator[]
  }

  return rows as unknown as ReelWithCreator[]
}

export const getReelById = cache(
  async (id: string): Promise<ReelWithCreator | null> => {
    const row = await prisma.reel.findUnique({
      where: { id, status: "approved" },
      select: reelSelect,
    })
    return row as unknown as ReelWithCreator | null
  },
)
