"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"

type ActionResult<T = void> = { ok: true; data?: T } | { ok: false; error: string }

async function authedClient() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated.")
  return { supabase, user }
}

export async function joinCommunity(communityId: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await authedClient()
    await supabase
      .from("community_members")
      .insert({ community_id: communityId, user_id: user.id })
    // bump count
    await supabase.rpc("increment", { x: 1 }).then(() => {}, () => {})
    revalidatePath("/communities")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function leaveCommunity(communityId: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await authedClient()
    await supabase
      .from("community_members")
      .delete()
      .eq("community_id", communityId)
      .eq("user_id", user.id)
    revalidatePath("/communities")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function createPost(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase, user } = await authedClient()
    const communityId = String(formData.get("community_id") ?? "")
    const title = String(formData.get("title") ?? "").trim() || null
    const body = String(formData.get("body") ?? "").trim() || null

    if (!communityId) return { ok: false, error: "Missing community." }
    if (!body && !title) return { ok: false, error: "Write something." }

    // Verify membership
    const { count } = await supabase
      .from("community_members")
      .select("*", { count: "exact", head: true })
      .eq("community_id", communityId)
      .eq("user_id", user.id)
    if (!count) return { ok: false, error: "Join the community before posting." }

    // Upload any media to /artworks bucket (re-using existing public bucket)
    const files = formData.getAll("media") as File[]
    const media: Array<{ url: string; kind: "image" | "video" }> = []
    let i = 0
    for (const f of files) {
      if (!f || !f.size) continue
      const ext = (f.name.split(".").pop() ?? "jpg").toLowerCase()
      const path = `${user.id}/community/${Date.now()}-${i}.${ext}`
      const { error: upErr } = await supabase.storage
        .from("artworks")
        .upload(path, f, { contentType: f.type, upsert: false })
      if (upErr) return { ok: false, error: upErr.message }
      const { data } = supabase.storage.from("artworks").getPublicUrl(path)
      media.push({
        url: data.publicUrl,
        kind: f.type.startsWith("video/") ? "video" : "image",
      })
      i++
    }

    await supabase.from("community_posts").insert({
      community_id: communityId,
      author_id: user.id,
      title,
      body,
      media,
      status: "approved", // posts auto-approved; moderators can hide later
    })

    revalidatePath("/communities")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function createPostComment(
  postId: string,
  body: string,
): Promise<ActionResult> {
  try {
    if (!body.trim()) return { ok: false, error: "Comment cannot be empty." }
    const { supabase, user } = await authedClient()
    await supabase.from("comments").insert({
      user_id: user.id,
      target_kind: "post",
      target_id: postId,
      body: body.trim(),
    })
    revalidatePath("/communities")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function createPoll(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase, user } = await authedClient()
    const postId = String(formData.get("post_id") ?? "")
    const question = String(formData.get("question") ?? "").trim()
    const options = (formData.getAll("option") as string[])
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6)

    if (!postId || !question || options.length < 2) {
      return { ok: false, error: "Need a question and at least 2 options." }
    }

    const { data: poll, error } = await supabase
      .from("polls")
      .insert({ post_id: postId, question, created_by: user.id })
      .select("id")
      .single()
    if (error || !poll) return { ok: false, error: error?.message ?? "Failed." }
    const pollId = (poll as { id: string }).id

    await supabase.from("poll_options").insert(
      options.map((label, i) => ({ poll_id: pollId, label, position: i })),
    )

    revalidatePath("/communities")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function votePoll(
  pollId: string,
  optionId: string,
): Promise<ActionResult> {
  try {
    const { supabase, user } = await authedClient()
    await supabase
      .from("poll_votes")
      .upsert(
        { poll_id: pollId, option_id: optionId, user_id: user.id },
        { onConflict: "poll_id,user_id" },
      )
    revalidatePath("/communities")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}
