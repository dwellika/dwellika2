import { NextResponse } from "next/server"
import { getApiSession } from "@/lib/api/auth"
import { trackReelEvent, updateUserInterest } from "@/lib/reels/analytics"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const body = await request.json().catch(() => ({}))
    const session = await getApiSession()
    const userId = session?.userId ?? null

    const sessionId =
      (body.sessionId as string) ?? `anon-${Date.now()}`
    const event = (body.event as string) ?? "view_end"
    const watchDuration =
      typeof body.watchDuration === "number" ? body.watchDuration : undefined
    const completionPct =
      typeof body.completionPct === "number" ? body.completionPct : undefined
    const tags = Array.isArray(body.tags) ? (body.tags as string[]) : []

    // Track in MongoDB (fire and forget)
    trackReelEvent({
      reel_id: id,
      user_id: userId,
      session_id: sessionId,
      event: event as Parameters<typeof trackReelEvent>[0]["event"],
      watch_duration: watchDuration,
      completion_pct: completionPct,
    }).catch(() => {})

    // Update PostgreSQL view_count on meaningful views
    if (event === "view_end" && completionPct && completionPct >= 50) {
      prisma.reel
        .update({
          where: { id },
          data: { view_count: { increment: 1 } },
        })
        .catch(() => {})
    }

    // Update user interests from reel tags
    if (userId && tags.length > 0 && event === "view_end") {
      const weight = completionPct ? completionPct / 100 : 0.3
      updateUserInterest(userId, tags, weight).catch(() => {})
    }

    return NextResponse.json({ ok: true })
  } catch {
    // Always 200 — tracking failures are silent
    return NextResponse.json({ ok: true })
  }
}
