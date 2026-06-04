"use server"

import { revalidateTag, revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { uploadFile } from "@/lib/storage/upload"

type ActionResult = { ok: false; error: string }

export async function createReel(formData: FormData): Promise<ActionResult | void> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." }
  const role = session.user.role
  if (!["artist", "admin", "super_admin"].includes(role ?? "")) {
    return { ok: false, error: "Only artists can post reels." }
  }
  const userId = session.user.id

  const caption = String(formData.get("caption") ?? "").trim() || null
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim().replace(/^#/, ""))
    .filter(Boolean)
    .slice(0, 12)
  const artworkId = String(formData.get("artwork_id") ?? "").trim() || null

  const video = formData.get("video") as File | null
  if (!video || !video.size) return { ok: false, error: "Upload a video." }
  if (!video.type.startsWith("video/")) return { ok: false, error: "File must be a video." }

  const thumb = formData.get("thumbnail") as File | null

  let videoUrl: string
  try {
    const result = await uploadFile(video, {
      folder: `dwellika/reels/${userId}`,
      resourceType: "video",
    })
    videoUrl = result.url
  } catch {
    return { ok: false, error: "Video upload failed. Try a smaller file." }
  }

  let thumbnailUrl: string | null = null
  if (thumb && thumb.size && thumb.type.startsWith("image/")) {
    try {
      const t = await uploadFile(thumb, { folder: `dwellika/reels/${userId}/thumbs`, resourceType: "image" })
      thumbnailUrl = t.url
    } catch {
      // non-fatal — thumbnail is optional
    }
  }

  await prisma.reel.create({
    data: {
      creator_id: userId,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      caption,
      tags,
      artwork_id: artworkId,
      // Reels are reviewed before going public (admin moderation queue)
      status: "pending",
    },
  })

  revalidateTag("reels")
  revalidatePath("/artist/dashboard")
  redirect("/artist/dashboard?reel=submitted")
}
