import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { ProfileRow } from "./types"

export type CompetitionStatus =
  | "draft"
  | "announced"
  | "submissions_open"
  | "voting"
  | "jury_review"
  | "completed"
  | "cancelled"

export interface CompetitionRow {
  id: string
  slug: string
  title: string
  description: string | null
  banner_url: string | null
  rules: string | null
  prize_pool: string | null
  status: CompetitionStatus
  submissions_open_at: string | null
  submissions_close_at: string | null
  voting_open_at: string | null
  voting_close_at: string | null
  announces_at: string | null
  category: string | null
  submission_count: number
  vote_count: number
}

export interface CompetitionSubmissionRow {
  id: string
  competition_id: string
  artist_id: string
  artwork_id: string | null
  title: string
  description: string | null
  media_url: string
  status: string
  vote_count: number
  created_at: string
  artist?: Pick<ProfileRow, "id" | "username" | "full_name" | "avatar_url"> | null
}

export interface CompetitionWinnerRow {
  id: string
  competition_id: string
  submission_id: string
  rank: number
  prize: string | null
  certificate_url: string | null
  announced_at: string
}

export async function listCompetitions({
  status,
  limit = 30,
}: {
  status?: CompetitionStatus | "all"
  limit?: number
} = {}) {
  const supabase = await createClient()
  let query = supabase
    .from("competitions")
    .select(
      "id, slug, title, description, banner_url, rules, prize_pool, status, submissions_open_at, submissions_close_at, voting_open_at, voting_close_at, announces_at, category, submission_count, vote_count",
    )
    .order("voting_close_at", { ascending: true, nullsFirst: false })
    .limit(limit)
  if (status && status !== "all") query = query.eq("status", status)
  const { data } = await query
  return (data ?? []) as unknown as CompetitionRow[]
}

export async function getCompetitionBySlug(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("competitions")
    .select(
      "id, slug, title, description, banner_url, rules, prize_pool, status, submissions_open_at, submissions_close_at, voting_open_at, voting_close_at, announces_at, category, submission_count, vote_count",
    )
    .eq("slug", slug)
    .maybeSingle()
  return data as unknown as CompetitionRow | null
}

export async function listSubmissions(
  competitionId: string,
  { limit = 60, sort = "newest" }: { limit?: number; sort?: "newest" | "top" } = {},
) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("competition_submissions")
    .select(
      `
        id, competition_id, artist_id, artwork_id, title, description, media_url, status, vote_count, created_at,
        artist:profiles!competition_submissions_artist_id_fkey ( id, username, full_name, avatar_url )
      `,
    )
    .eq("competition_id", competitionId)
    .eq("status", "approved")
    .order(sort === "top" ? "vote_count" : "created_at", { ascending: false })
    .limit(limit)
  return (data ?? []) as unknown as CompetitionSubmissionRow[]
}

export async function listWinners(competitionId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("competition_winners")
    .select(
      `
        id, competition_id, submission_id, rank, prize, certificate_url, announced_at,
        submission:competition_submissions!competition_winners_submission_id_fkey ( title, media_url, artist:profiles!competition_submissions_artist_id_fkey ( username, full_name, avatar_url ) )
      `,
    )
    .eq("competition_id", competitionId)
    .order("rank", { ascending: true })
  return (data ?? []) as unknown as Array<
    CompetitionWinnerRow & {
      submission: {
        title: string
        media_url: string
        artist: { username: string | null; full_name: string | null; avatar_url: string | null } | null
      } | null
    }
  >
}

export async function getMyVotes(competitionId: string, userId: string | undefined) {
  if (!userId) return new Set<string>()
  const supabase = await createClient()
  const { data } = await supabase
    .from("competition_votes")
    .select("submission_id, competition_submissions!inner(competition_id)")
    .eq("competition_submissions.competition_id", competitionId)
    .eq("voter_id", userId)
  return new Set(((data ?? []) as { submission_id: string }[]).map((r) => r.submission_id))
}

export async function getMySubmission(competitionId: string, userId: string | undefined) {
  if (!userId) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from("competition_submissions")
    .select("id, status, title")
    .eq("competition_id", competitionId)
    .eq("artist_id", userId)
    .maybeSingle()
  return data as { id: string; status: string; title: string } | null
}
