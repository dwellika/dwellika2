"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

type ActionResult = { ok: true } | { ok: false; error: string }

export async function submitEntry(formData: FormData): Promise<ActionResult | void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Sign in to submit." }

  const competitionId = String(formData.get("competition_id") ?? "")
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim() || null
  const artworkId = (formData.get("artwork_id") as string) || null
  const file = formData.get("media") as File | null

  if (!competitionId || !title) {
    return { ok: false, error: "Missing competition or title." }
  }
  if (!file || !file.size) {
    return { ok: false, error: "Upload an image of your submission." }
  }

  // Check submission window
  const { data: comp } = await supabase
    .from("competitions")
    .select("status, submissions_close_at, slug")
    .eq("id", competitionId)
    .maybeSingle()
  if (!comp) return { ok: false, error: "Competition not found." }
  const c = comp as { status: string; submissions_close_at: string | null; slug: string }
  if (c.status !== "submissions_open") {
    return { ok: false, error: "Submissions aren't currently open." }
  }

  // Upload media to artworks bucket under user's folder
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase()
  const path = `${user.id}/competitions/${competitionId}/${Date.now()}.${ext}`
  const { error: upErr } = await supabase.storage
    .from("artworks")
    .upload(path, file, { contentType: file.type })
  if (upErr) return { ok: false, error: upErr.message }
  const { data: pub } = supabase.storage.from("artworks").getPublicUrl(path)

  const { error } = await supabase
    .from("competition_submissions")
    .upsert(
      {
        competition_id: competitionId,
        artist_id: user.id,
        artwork_id: artworkId,
        title,
        description,
        media_url: pub.publicUrl,
        status: "pending",
      },
      { onConflict: "competition_id,artist_id" },
    )
  if (error) return { ok: false, error: error.message }

  revalidatePath(`/competitions/${c.slug}`)
  redirect(`/competitions/${c.slug}?submitted=1`)
}

export async function castVote(submissionId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: "Sign in to vote." }

    const { data: sub } = await supabase
      .from("competition_submissions")
      .select("competition_id, artist_id, competitions!inner(status)")
      .eq("id", submissionId)
      .maybeSingle()
    const subRow = sub as
      | { competition_id: string; artist_id: string; competitions: { status: string } }
      | null
    if (!subRow) return { ok: false, error: "Submission not found." }
    if (subRow.competitions.status !== "voting") {
      return { ok: false, error: "Voting is not open." }
    }
    if (subRow.artist_id === user.id) {
      return { ok: false, error: "You can&apos;t vote for your own entry." }
    }

    const { error } = await supabase
      .from("competition_votes")
      .insert({ submission_id: submissionId, voter_id: user.id })
    if (error) return { ok: false, error: error.message }

    // Increment vote_count counter (best-effort)
    const admin = createAdminClient()
    await admin.rpc("noop", {}).then(() => {}, () => {})
    await admin
      .from("competition_submissions")
      .update({ vote_count: (await getVoteCount(submissionId)) })
      .eq("id", submissionId)

    revalidatePath("/competitions")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function removeVote(submissionId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: "Sign in to vote." }
    await supabase
      .from("competition_votes")
      .delete()
      .eq("submission_id", submissionId)
      .eq("voter_id", user.id)

    const admin = createAdminClient()
    await admin
      .from("competition_submissions")
      .update({ vote_count: (await getVoteCount(submissionId)) })
      .eq("id", submissionId)

    revalidatePath("/competitions")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

async function getVoteCount(submissionId: string) {
  const admin = createAdminClient()
  const { count } = await admin
    .from("competition_votes")
    .select("*", { count: "exact", head: true })
    .eq("submission_id", submissionId)
  return count ?? 0
}

export async function announceWinners(
  competitionId: string,
  ranks: Array<{ submission_id: string; rank: number; prize?: string }>,
): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: "Not authenticated" }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()
    const role = (profile as { role?: string } | null)?.role
    if (role !== "admin" && role !== "super_admin") {
      return { ok: false, error: "Admins only." }
    }

    const admin = createAdminClient()
    for (const r of ranks) {
      await admin.from("competition_winners").upsert(
        {
          competition_id: competitionId,
          submission_id: r.submission_id,
          rank: r.rank,
          prize: r.prize ?? null,
        },
        { onConflict: "competition_id,rank" },
      )
    }
    await admin
      .from("competitions")
      .update({ status: "completed" })
      .eq("id", competitionId)

    revalidatePath("/competitions")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}
