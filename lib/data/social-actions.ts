"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import type { ReactionTarget } from "@/lib/types/database"

type ActionResult = { ok: true; state?: boolean } | { ok: false; error: string }

async function getSessionUserOrThrow() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not authenticated")
  return session.user.id
}

export async function toggleLike(targetKind: ReactionTarget, targetId: string): Promise<ActionResult> {
  try {
    const userId = await getSessionUserOrThrow()
    const existing = await prisma.like.findUnique({
      where: { user_id_target_kind_target_id: { user_id: userId, target_kind: targetKind, target_id: targetId } },
      select: { id: true },
    })

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } })
    } else {
      await prisma.like.create({ data: { user_id: userId, target_kind: targetKind, target_id: targetId } })
    }
    return { ok: true, state: !existing }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function toggleSave(targetKind: ReactionTarget, targetId: string, collection = "default"): Promise<ActionResult> {
  try {
    const userId = await getSessionUserOrThrow()
    const existing = await prisma.save.findUnique({
      where: { user_id_target_kind_target_id_collection: { user_id: userId, target_kind: targetKind, target_id: targetId, collection } },
      select: { id: true },
    })

    if (existing) {
      await prisma.save.delete({ where: { id: existing.id } })
    } else {
      await prisma.save.create({ data: { user_id: userId, target_kind: targetKind, target_id: targetId, collection } })
    }
    revalidatePath("/wishlist")
    return { ok: true, state: !existing }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function toggleFollow(targetUserId: string): Promise<ActionResult> {
  try {
    const userId = await getSessionUserOrThrow()
    if (userId === targetUserId) return { ok: false, error: "You can't follow yourself." }

    const existing = await prisma.follow.findUnique({
      where: { follower_id_following_id: { follower_id: userId, following_id: targetUserId } },
    })

    if (existing) {
      await prisma.follow.delete({ where: { follower_id_following_id: { follower_id: userId, following_id: targetUserId } } })
    } else {
      await prisma.follow.create({ data: { follower_id: userId, following_id: targetUserId } })
    }
    return { ok: true, state: !existing }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function isLiked(targetKind: ReactionTarget, targetId: string) {
  const session = await auth()
  if (!session?.user?.id) return false
  const count = await prisma.like.count({
    where: { user_id: session.user.id, target_kind: targetKind, target_id: targetId },
  })
  return count > 0
}

export async function isSaved(targetKind: ReactionTarget, targetId: string) {
  const session = await auth()
  if (!session?.user?.id) return false
  const count = await prisma.save.count({
    where: { user_id: session.user.id, target_kind: targetKind, target_id: targetId },
  })
  return count > 0
}
