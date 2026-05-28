import { NextResponse, type NextRequest } from "next/server"

import { embedText, isEmbeddingConfigured } from "@/lib/ai/provider"
import { prisma } from "@/lib/prisma"

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
    if (!isEmbeddingConfigured()) {
      return NextResponse.json(
        { ok: false, configured: false, error: "AI search requires an OpenAI API key. Add OPENAI_API_KEY to .env.local." },
        { status: 503 },
      )
    }

    const embedding = await embedText(q)
    if (!embedding) {
      return NextResponse.json({ ok: false, error: "Failed to embed query." }, { status: 500 })
    }

    const cap = Math.min(limit, 50)

    if (kind === "products") {
      const results = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM products
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> ${JSON.stringify(embedding)}::vector
        LIMIT ${cap}
      `
      return NextResponse.json({ ok: true, results })
    }

    const results = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM artworks
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> ${JSON.stringify(embedding)}::vector
      LIMIT ${cap}
    `
    return NextResponse.json({ ok: true, results })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    )
  }
}
