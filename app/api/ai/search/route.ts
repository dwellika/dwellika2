import { NextResponse, type NextRequest } from "next/server"

import { embedText, isOpenAIConfigured } from "@/lib/ai/openai"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { q, kind = "artworks", limit = 20 } = (await request.json()) as {
      q?: string
      kind?: "artworks" | "products"
      limit?: number
    }
    if (!q || !q.trim()) {
      return NextResponse.json({ ok: false, error: "Missing query." }, { status: 400 })
    }
    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "AI search is not configured. Add OPENAI_API_KEY to .env.local to enable.",
        },
        { status: 503 },
      )
    }

    const embedding = await embedText(q)
    if (!embedding) {
      return NextResponse.json(
        { ok: false, error: "Failed to embed query." },
        { status: 500 },
      )
    }

    const supabase = await createClient()
    const fn = kind === "products" ? "search_products" : "search_artworks"
    const { data, error } = await supabase.rpc(fn, {
      query_embedding: embedding as unknown as string,
      match_count: limit,
      match_threshold: 0.2,
    })
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true, results: data ?? [] })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    )
  }
}
