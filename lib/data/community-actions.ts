"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { uploadFile } from "@/lib/storage/upload"

type ActionResult<T = void> = { ok: true; data?: T } | { ok: false; error: string }

async function getSessionUser() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not authenticated.")
  return session.user.id
}

export async function joinCommunity(communityId: string): Promise<ActionResult> {
  try {
    const userId = await getSessionUser()
    await prisma.communityMember.upsert({
      where: { community_id_user_id: { community_id: communityId, user_id: userId } },
      create: { community_id: communityId, user_id: userId },
      update: {},
    })
    await prisma.community.update({
      where: { id: communityId },
      data: { member_count: { increment: 1 } },
    }).catch(() => {})
    revalidatePath("/communities")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function leaveCommunity(communityId: string): Promise<ActionResult> {
  try {
    const userId = await getSessionUser()
    await prisma.communityMember.delete({
      where: { community_id_user_id: { community_id: communityId, user_id: userId } },
    })
    await prisma.community.update({
      where: { id: communityId },
      data: { member_count: { decrement: 1 } },
    }).catch(() => {})
    revalidatePath("/communities")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function createPost(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await getSessionUser()
    const communityId = String(formData.get("community_id") ?? "")
    const title = String(formData.get("title") ?? "").trim() || null
    const body = String(formData.get("body") ?? "").trim() || null

    if (!communityId) return { ok: false, error: "Missing community." }
    if (!body && !title) return { ok: false, error: "Write something." }

    const isMember = await prisma.communityMember.findUnique({
      where: { community_id_user_id: { community_id: communityId, user_id: userId } },
    })
    if (!isMember) return { ok: false, error: "Join the community before posting." }

    const files = formData.getAll("media") as File[]
    const media: Array<{ url: string; kind: "image" | "video" }> = []

    for (const f of files) {
      if (!f || !f.size) continue
      const result = await uploadFile(f, { folder: `dwellika/community/${communityId}`, resourceType: "auto" })
      media.push({ url: result.url, kind: f.type.startsWith("video/") ? "video" : "image" })
    }

    await prisma.communityPost.create({
      data: { community_id: communityId, author_id: userId, title, body, media, status: "approved" },
    })

    revalidatePath("/communities")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function createPostComment(postId: string, body: string): Promise<ActionResult> {
  try {
    if (!body.trim()) return { ok: false, error: "Comment cannot be empty." }
    const userId = await getSessionUser()
    await prisma.comment.create({
      data: { user_id: userId, target_kind: "post", target_id: postId, body: body.trim() },
    })
    revalidatePath("/communities")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function createPoll(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await getSessionUser()
    const postId = String(formData.get("post_id") ?? "")
    const question = String(formData.get("question") ?? "").trim()
    const options = (formData.getAll("option") as string[]).map((s) => s.trim()).filter(Boolean).slice(0, 6)

    if (!postId || !question || options.length < 2) {
      return { ok: false, error: "Need a question and at least 2 options." }
    }

    await prisma.poll.create({
      data: {
        post_id: postId,
        question,
        created_by: userId,
        options: { create: options.map((label, i) => ({ label, position: i })) },
      },
    })

    revalidatePath("/communities")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function votePoll(pollId: string, optionId: string): Promise<ActionResult> {
  try {
    const userId = await getSessionUser()
    await prisma.pollVote.upsert({
      where: { poll_id_user_id: { poll_id: pollId, user_id: userId } },
      create: { poll_id: pollId, option_id: optionId, user_id: userId },
      update: { option_id: optionId },
    })
    revalidatePath("/communities")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}
