import "server-only"

import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import type { Community, CommunityPost } from "@prisma/client"

export type CommunityRow = Community
export type CommunityPostRow = CommunityPost & {
  author: { id: string; username: string | null; full_name: string | null; avatar_url: string | null } | null
  polls: Array<{
    id: string
    question: string
    options: Array<{ id: string; label: string; position: number }>
  }>
}

type ListCommunitiesParams = {
  q?: string
  category?: string
  limit?: number
  offset?: number
}

async function _listCommunitiesImpl({
  q,
  category,
  limit = 24,
  offset = 0,
}: ListCommunitiesParams = {}) {
  const where = {
    ...(category ? { category } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const [communities, count] = await prisma.$transaction([
    prisma.community.findMany({ where, orderBy: { member_count: "desc" }, take: limit, skip: offset }),
    prisma.community.count({ where }),
  ])

  return { communities, count }
}

export function listCommunities(params: ListCommunitiesParams = {}) {
  const key = JSON.stringify(params, Object.keys(params).sort())
  return unstable_cache(
    () => _listCommunitiesImpl(params),
    ["list-communities", key],
    { revalidate: 300, tags: ["communities"] },
  )()
}

export async function getCommunityBySlug(slug: string) {
  return prisma.community.findUnique({ where: { slug } })
}

export async function getMembership(communityId: string, userId: string | undefined) {
  if (!userId) return null
  const membership = await prisma.communityMember.findUnique({
    where: { community_id_user_id: { community_id: communityId, user_id: userId } },
    select: { role: true },
  })
  return membership?.role ?? null
}

export async function listCommunityPosts(communityId: string, { limit = 30, offset = 0 } = {}) {
  return prisma.communityPost.findMany({
    where: { community_id: communityId, status: "approved" },
    include: {
      author: { select: { id: true, username: true, full_name: true, avatar_url: true } },
      polls: { include: { options: { orderBy: { position: "asc" } } } },
    },
    orderBy: { created_at: "desc" },
    take: limit,
    skip: offset,
  })
}

export async function getPollForPost(postId: string) {
  return prisma.poll.findFirst({
    where: { post_id: postId },
    include: { options: { orderBy: { position: "asc" } } },
  })
}

export async function getPollTallies(pollId: string) {
  const votes = await prisma.pollVote.groupBy({
    by: ["option_id"],
    where: { poll_id: pollId },
    _count: true,
  })
  const counts: Record<string, number> = {}
  for (const v of votes) {
    counts[v.option_id] = v._count
  }
  return counts
}

export async function getMyPollVote(pollId: string, userId: string | undefined) {
  if (!userId) return null
  const vote = await prisma.pollVote.findUnique({
    where: { poll_id_user_id: { poll_id: pollId, user_id: userId } },
    select: { option_id: true },
  })
  return vote?.option_id ?? null
}
