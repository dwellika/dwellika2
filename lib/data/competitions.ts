import "server-only"

import { prisma } from "@/lib/prisma"

export type CompetitionStatus =
  | "draft" | "announced" | "submissions_open" | "voting"
  | "jury_review" | "completed" | "cancelled"

export async function listCompetitions({ status, limit = 30 }: { status?: CompetitionStatus | "all"; limit?: number } = {}) {
  return prisma.competition.findMany({
    where: status && status !== "all" ? { status } : {},
    orderBy: { voting_close_at: "asc" },
    take: limit,
  })
}

export async function getCompetitionBySlug(slug: string) {
  return prisma.competition.findUnique({ where: { slug } })
}

export async function listSubmissions(
  competitionId: string,
  { limit = 60, sort = "newest" }: { limit?: number; sort?: "newest" | "top" } = {},
) {
  return prisma.competitionSubmission.findMany({
    where: { competition_id: competitionId, status: "approved" },
    include: {
      artist: { select: { id: true, username: true, full_name: true, avatar_url: true } },
    },
    orderBy: sort === "top" ? { vote_count: "desc" } : { created_at: "desc" },
    take: limit,
  })
}

export async function listWinners(competitionId: string) {
  return prisma.competitionWinner.findMany({
    where: { competition_id: competitionId },
    include: {
      submission: {
        include: {
          artist: { select: { username: true, full_name: true, avatar_url: true } },
        },
      },
    },
    orderBy: { rank: "asc" },
  })
}

export async function getMyVotes(competitionId: string, userId: string | undefined) {
  if (!userId) return new Set<string>()
  const votes = await prisma.competitionVote.findMany({
    where: {
      voter_id: userId,
      submission: { competition_id: competitionId },
    },
    select: { submission_id: true },
  })
  return new Set(votes.map((v) => v.submission_id))
}

export async function getMySubmission(competitionId: string, userId: string | undefined) {
  if (!userId) return null
  return prisma.competitionSubmission.findUnique({
    where: { competition_id_artist_id: { competition_id: competitionId, artist_id: userId } },
    select: { id: true, status: true, title: true },
  })
}
