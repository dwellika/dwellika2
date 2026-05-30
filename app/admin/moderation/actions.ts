"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export type Surface =
  | "artworks"
  | "reels"
  | "community_posts"
  | "competition_submissions"
  | "products"

export type Decision = "approved" | "rejected" | "hidden" | "deleted"

type ActionResult = { ok: true } | { ok: false; error: string }

const SURFACES: Surface[] = [
  "artworks",
  "reels",
  "community_posts",
  "competition_submissions",
  "products",
]

const MODEL_MAP: Record<Surface, string> = {
  artworks:                "artwork",
  reels:                   "reel",
  community_posts:         "communityPost",
  competition_submissions: "competitionSubmission",
  products:                "product",
}

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  const role = session.user.role as string | undefined
  if (role !== "admin" && role !== "super_admin") return null
  return session.user.id
}

export async function moderate(
  surface: Surface,
  ids: string[],
  decision: Decision,
  notes: string,
): Promise<ActionResult> {
  try {
    if (!SURFACES.includes(surface)) return { ok: false, error: "Invalid surface." }
    if (ids.length === 0) return { ok: false, error: "Select at least one item." }
    if (decision !== "approved" && !notes.trim()) {
      return { ok: false, error: "Notes are required when rejecting, hiding, or deleting." }
    }

    const adminId = await requireAdmin()
    if (!adminId) return { ok: false, error: "Admins only." }

    const modelName = MODEL_MAP[surface]

    if (decision === "deleted") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any)[modelName].deleteMany({ where: { id: { in: ids } } })
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any)[modelName].updateMany({
        where: { id: { in: ids } },
        data:  { status: decision },
      })
    }

    await prisma.moderationLog.createMany({
      data: ids.map((id) => ({
        admin_id:    adminId,
        action:      `moderate:${decision}`,
        target_kind: surface,
        target_id:   id,
        notes:       notes || null,
      })),
    })

    revalidatePath("/admin/moderation")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}
