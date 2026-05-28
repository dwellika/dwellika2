"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
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

    const session = await auth()
    if (!session?.user?.id) return { ok: false, error: "Sign in to comment." }

    await prisma.comment.create({
      data: {
        user_id: session.user.id,
        target_kind: targetKind,
        target_id: targetId,
        parent_id: parentId ?? null,
        body: trimmed,
      },
    })

    revalidatePath("/")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function deleteComment(commentId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { ok: false, error: "Not authenticated" }

    await prisma.comment.delete({
      where: { id: commentId, user_id: session.user.id },
    })

    revalidatePath("/")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}
