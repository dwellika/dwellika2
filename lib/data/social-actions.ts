"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import type { ReactionTarget } from "@/lib/types/database"

type ActionResult = { ok: true; state?: boolean } | { ok: false; error: string }

async function getUserOrThrow() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  return { supabase, user }
}

export async function toggleLike(
  targetKind: ReactionTarget,
  targetId: string,
): Promise<ActionResult> {
  try {
    const { supabase, user } = await getUserOrThrow()
    const { data: existing } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("target_kind", targetKind)
      .eq("target_id", targetId)
      .maybeSingle()

    if (existing) {
      await supabase.from("likes").delete().eq("id", (existing as { id: string }).id)
    } else {
      await supabase
        .from("likes")
        .insert({ user_id: user.id, target_kind: targetKind, target_id: targetId })
    }
    return { ok: true, state: !existing }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function toggleSave(
  targetKind: ReactionTarget,
  targetId: string,
  collection = "default",
): Promise<ActionResult> {
  try {
    const { supabase, user } = await getUserOrThrow()
    const { data: existing } = await supabase
      .from("saves")
      .select("id")
      .eq("user_id", user.id)
      .eq("target_kind", targetKind)
      .eq("target_id", targetId)
      .eq("collection", collection)
      .maybeSingle()

    if (existing) {
      await supabase.from("saves").delete().eq("id", (existing as { id: string }).id)
    } else {
      await supabase
        .from("saves")
        .insert({ user_id: user.id, target_kind: targetKind, target_id: targetId, collection })
    }
    revalidatePath("/wishlist")
    return { ok: true, state: !existing }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function toggleFollow(targetUserId: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await getUserOrThrow()
    if (user.id === targetUserId) {
      return { ok: false, error: "You can&apos;t follow yourself." }
    }

    const { data: existing } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId)
      .maybeSingle()

    if (existing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId)
    } else {
      await supabase
        .from("follows")
        .insert({ follower_id: user.id, following_id: targetUserId })
    }
    return { ok: true, state: !existing }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function isLiked(targetKind: ReactionTarget, targetId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false
  const { count } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("target_kind", targetKind)
    .eq("target_id", targetId)
  return (count ?? 0) > 0
}

export async function isSaved(targetKind: ReactionTarget, targetId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false
  const { count } = await supabase
    .from("saves")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("target_kind", targetKind)
    .eq("target_id", targetId)
  return (count ?? 0) > 0
}
