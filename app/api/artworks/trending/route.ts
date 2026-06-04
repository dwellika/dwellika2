export const runtime = "nodejs"

import { NextResponse } from "next/server"

import { listArtworks } from "@/lib/data/artworks"

/**
 * Trending artworks — used as the fallback for the recommendations rail when
 * personalised AI recommendations are unavailable. Ranks by popularity
 * (like_count) among approved works.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const limit = Math.min(24, Math.max(1, Number(searchParams.get("limit") ?? 12) || 12))

  try {
    const { artworks } = await listArtworks({ sort: "popular", limit, status: "approved" })

    const results = artworks.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      artist_id: a.artist_id,
      artist_username: a.artist?.username ?? null,
      primary_url: a.artwork_media?.[0]?.url ?? null,
      price: a.price != null ? Number(a.price) : null,
      currency: a.currency,
    }))

    return NextResponse.json({ ok: true, artworks: results })
  } catch {
    // Never error the rail — just return nothing so it hides gracefully.
    return NextResponse.json({ ok: true, artworks: [] })
  }
}
