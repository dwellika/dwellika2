import "server-only"

import { prisma } from "@/lib/prisma"

export async function listReels({
  limit = 12,
  offset = 0,
  creatorId,
}: { limit?: number; offset?: number; creatorId?: string } = {}) {
  return prisma.reel.findMany({
    where: {
      status: "approved",
      ...(creatorId ? { creator_id: creatorId } : {}),
    },
    include: {
      creator: { select: { id: true, username: true, full_name: true, avatar_url: true } },
      artwork: { select: { slug: true, price: true, for_sale: true } },
      product: { select: { slug: true, price: true } },
    },
    orderBy: { published_at: "desc" },
    take: limit,
    skip: offset,
  })
}
