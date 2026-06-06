"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { computeFeatureScore } from "./score"

type ActionResult = { ok: true; score: number } | { ok: false; error: string }

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  const role = session.user.role as string | undefined
  if (role !== "admin" && role !== "super_admin") return null
  return session.user.id
}

const clamp = (n: number) => Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0))

export async function evaluateFeatured(
  submissionId: string,
  raw: { quality: number; engagement: number; sales: number; freshness: number; diversity: number; curator: number },
  decision: "featured" | "rejected",
  notes: string,
): Promise<ActionResult> {
  try {
    const adminId = await requireAdmin()
    if (!adminId) return { ok: false, error: "Admins only." }

    const scores = {
      quality: clamp(raw.quality),
      engagement: clamp(raw.engagement),
      sales: clamp(raw.sales),
      freshness: clamp(raw.freshness),
      diversity: clamp(raw.diversity),
      curator: clamp(raw.curator),
    }
    const feature_score = computeFeatureScore(scores)

    const sub = await prisma.featuredSubmission.update({
      where: { id: submissionId },
      data: {
        quality_score: scores.quality,
        engagement_score: scores.engagement,
        sales_score: scores.sales,
        freshness_score: scores.freshness,
        diversity_bonus: scores.diversity,
        curator_boost: scores.curator,
        feature_score,
        status: decision,
        reviewed_by: adminId,
        reviewed_at: new Date(),
        admin_notes: notes || null,
      },
      select: { artist_id: true },
    })

    await prisma.notification.create({
      data: {
        user_id: sub.artist_id,
        kind: "system",
        title: decision === "featured" ? "Your artwork was featured!" : "Featured submission reviewed",
        body:
          decision === "featured"
            ? `Your work scored ${feature_score.toFixed(1)} and is now in the Featured collection.`
            : notes || "Your submission wasn't selected this time. Keep creating!",
        action_url: "/artist/featured",
      },
    })

    await prisma.moderationLog.create({
      data: {
        admin_id: adminId,
        action: `featured:${decision}`,
        target_kind: "featured_submission",
        target_id: submissionId,
        notes: `score=${feature_score}${notes ? ` · ${notes}` : ""}`,
      },
    })

    revalidatePath("/admin/featured")
    return { ok: true, score: feature_score }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}
