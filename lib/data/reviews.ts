import "server-only"

import { prisma } from "@/lib/prisma"
import type { ReviewTarget } from "@/lib/types/database"

export type ReviewWithReviewer = Awaited<ReturnType<typeof listReviews>>[number]

export async function listReviews(target: { kind: ReviewTarget; id: string }, limit = 12) {
  return prisma.review.findMany({
    where: { target_kind: target.kind, target_id: target.id, is_hidden: false },
    include: {
      reviewer: { select: { id: true, username: true, full_name: true, avatar_url: true } },
    },
    orderBy: { created_at: "desc" },
    take: limit,
  })
}

export async function reviewSummary(target: { kind: ReviewTarget; id: string }) {
  const reviews = await prisma.review.findMany({
    where: { target_kind: target.kind, target_id: target.id, is_hidden: false },
    select: { rating: true },
  })
  const ratings = reviews.map((r) => r.rating)
  if (!ratings.length) return { count: 0, average: 0, distribution: [0, 0, 0, 0, 0] }
  const distribution = [0, 0, 0, 0, 0]
  for (const r of ratings) distribution[Math.max(1, Math.min(5, r)) - 1]++
  return {
    count: ratings.length,
    average: ratings.reduce((a, b) => a + b, 0) / ratings.length,
    distribution,
  }
}
