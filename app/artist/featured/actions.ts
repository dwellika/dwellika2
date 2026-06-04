"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

type ActionResult = { ok: true } | { ok: false; error: string }

export async function submitToFeatured(artworkId: string, pitch: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." }
  const userId = session.user.id

  // Must own the artwork and it must be approved/published.
  const artwork = await prisma.artwork.findFirst({
    where: { id: artworkId, artist_id: userId },
    select: { id: true, status: true },
  })
  if (!artwork) return { ok: false, error: "Artwork not found." }
  if (artwork.status !== "approved") {
    return { ok: false, error: "Only approved artworks can be submitted for the featured collection." }
  }

  const existing = await prisma.featuredSubmission.findUnique({
    where: { artwork_id: artworkId },
    select: { status: true },
  })
  if (existing && existing.status !== "rejected") {
    return { ok: false, error: "This artwork is already submitted." }
  }

  await prisma.featuredSubmission.upsert({
    where: { artwork_id: artworkId },
    create: { artwork_id: artworkId, artist_id: userId, pitch: pitch.trim() || null, status: "pending" },
    update: { pitch: pitch.trim() || null, status: "pending", feature_score: null, reviewed_at: null, reviewed_by: null },
  })

  revalidatePath("/artist/featured")
  return { ok: true }
}
