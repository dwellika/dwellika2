import "server-only"

import { prisma } from "@/lib/prisma"

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
}: ArtistListParams = {}) {
  const where = {
    role: "artist" as const,
    artist_profile: { isNot: null },
    ...(mediums?.length || styles?.length
      ? {
          artist_profile: {
            ...(mediums?.length ? { mediums: { hasSome: mediums } } : {}),
            ...(styles?.length ? { styles: { hasSome: styles } } : {}),
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            { username: { contains: q, mode: "insensitive" as const } },
            { full_name: { contains: q, mode: "insensitive" as const } },
            { bio: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const [artists, count] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        full_name: true,
        avatar_url: true,
        cover_url: true,
        bio: true,
        is_verified: true,
        location: true,
        artist_profile: {
          select: { tier: true, specialty: true, styles: true, mediums: true, is_verified: true },
        },
      },
      orderBy: { created_at: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.user.count({ where }),
  ])

  return { artists, count, error: null }
}

export async function getProfileByUsername(username: string) {
  return prisma.user.findFirst({
    where: { username },
    select: {
      id: true,
      role: true,
      username: true,
      full_name: true,
      avatar_url: true,
      cover_url: true,
      bio: true,
      website: true,
      socials: true,
      location: true,
      interests: true,
      is_verified: true,
      created_at: true,
      artist_profile: {
        select: { tier: true, specialty: true, styles: true, mediums: true, is_verified: true, stats: true },
      },
    },
  })
}

export async function getFollowCounts(userId: string) {
  const [followersCount, followingCount] = await prisma.$transaction([
    prisma.follow.count({ where: { following_id: userId } }),
    prisma.follow.count({ where: { follower_id: userId } }),
  ])
  return { followers: followersCount, following: followingCount }
}

export async function isFollowing(viewerId: string | undefined, targetId: string) {
  if (!viewerId || viewerId === targetId) return false
  const count = await prisma.follow.count({
    where: { follower_id: viewerId, following_id: targetId },
  })
  return count > 0
}
