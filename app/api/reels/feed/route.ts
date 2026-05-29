import { NextResponse } from "next/server"
import { getApiSession } from "@/lib/api/auth"
import { listReels } from "@/lib/data/reels"
import {
  getRankedReelIds,
  getTrendingReelIds,
  markReelSeen,
} from "@/lib/reels/analytics"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cursor = parseInt(searchParams.get("cursor") ?? "0", 10)
    const mode = searchParams.get("mode") ?? "personalized" // personalized | trending | explore
    const LIMIT = 10

    const session = await getApiSession()
    const userId = session?.userId ?? null

    let reelIds: string[] = []

    if (mode === "trending") {
      const trending = await getTrendingReelIds(LIMIT * 2)
      reelIds = trending.slice(cursor, cursor + LIMIT)
    } else {
      // Personalized: ranked + dedup seen
      reelIds = await getRankedReelIds({ userId, limit: LIMIT, excludeIds: [] })
      reelIds = reelIds.slice(cursor, cursor + LIMIT)
    }

    let reels
    if (reelIds.length > 0) {
      reels = await listReels({ ids: reelIds })
      // Tag trending/recommended
      const trendingIds = new Set(mode === "trending" ? reelIds : [])
      reels = reels.map((r, i) => ({
        ...r,
        _isTrending: trendingIds.has(r.id),
        _isRecommended: mode === "personalized" && i < 3,
      }))
    } else {
      // Fall back to fresh PostgreSQL ordering
      reels = await listReels({ limit: LIMIT, offset: cursor })
    }

    // Mark as seen (non-blocking)
    if (userId && reels.length > 0) {
      markReelSeen(
        userId,
        reels.map((r) => r.id),
      ).catch(() => {})
    }

    const response = NextResponse.json({
      ok: true,
      reels,
      nextCursor: cursor + LIMIT,
      hasMore: reels.length === LIMIT,
    })
    // Cache personalized feeds briefly; trending can be cached longer
    response.headers.set(
      "Cache-Control",
      mode === "trending"
        ? "public, s-maxage=30, stale-while-revalidate=120"
        : "private, s-maxage=0",
    )
    return response
  } catch (e) {
    console.error("[reels/feed]", e)
    // Fallback to basic list
    try {
      const reels = await listReels({ limit: 10, offset: 0 })
      return NextResponse.json({
        ok: true,
        reels,
        nextCursor: 10,
        hasMore: reels.length === 10,
      })
    } catch {
      return NextResponse.json(
        { ok: false, error: "Failed to load feed" },
        { status: 500 },
      )
    }
  }
}
