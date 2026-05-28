import { NextResponse } from "next/server"

import { embedText, isOpenAIConfigured } from "@/lib/ai/openai"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ ok: true, results: [] })
    }
    if (!isOpenAIConfigured()) {
      return NextResponse.json({ ok: false, error: "OPENAI_API_KEY missing" }, { status: 503 })
    }

    const signals = await prisma.save.findMany({
      where: { user_id: session.user.id, target_kind: "artwork" },
      select: { target_id: true },
      orderBy: { created_at: "desc" },
      take: 20,
    })

    const ids = signals.map((s) => s.target_id)
    if (ids.length === 0) {
      return NextResponse.json({ ok: true, results: [] })
    }

    const items = await prisma.artwork.findMany({
      where: { id: { in: ids } },
      select: { title: true, medium: true, style: true, subject: true, tags: true },
      take: 20,
    })

    const text = items
      .map((a) => `${a.title} — ${a.medium ?? ""} ${a.style ?? ""} ${a.subject ?? ""} ${(a.tags ?? []).join(" ")}`)
      .join("\n")

    const embedding = await embedText(text)
    if (!embedding) {
      return NextResponse.json({ ok: false, error: "embed failed" }, { status: 500 })
    }

    const matches = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM artworks
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> ${JSON.stringify(embedding)}::vector
      LIMIT 16
    `

    const savedSet = new Set(ids)
    const results = matches.filter((m) => !savedSet.has(m.id))

    return NextResponse.json({ ok: true, results })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    )
  }
}
