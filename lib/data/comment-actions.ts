"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import type { ReactionTarget } from "@/lib/types/database"

type ActionResult = { ok: true } | { ok: false; error: string }

export async function postComment(
  targetKind: ReactionTarget,
  targetId: string,
  body: string,
  parentId?: string | null,
): Promise<ActionResult> {
  try {
    const trimmed = body.trim()
    if (!trimmed) return { ok: false, error: "Write something." }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: "Sign in to comment." }

    const { error } = await supabase.from("comments").insert({
      user_id: user.id,
      target_kind: targetKind,
      target_id: targetId,
      parent_id: parentId ?? null,
      body: trimmed,
    })
    if (error) return { ok: false, error: error.message }

    revalidatePath("/")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function deleteComment(commentId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: "Not authenticated" }
    const { error } = await supabase.from("comments").delete().eq("id", commentId)
    if (error) return { ok: false, error: error.message }
    revalidatePath("/")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}
