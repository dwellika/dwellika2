import { NextResponse, type NextRequest } from "next/server"

import { embedText, isOpenAIConfigured } from "@/lib/ai/openai"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    if (!isOpenAIConfigured()) {
      return NextResponse.json({ ok: false, error: "OPENAI_API_KEY missing" }, { status: 503 })
    }

    const { artworkId } = (await request.json()) as { artworkId?: string }
    if (!artworkId) return NextResponse.json({ ok: false, error: "Missing artworkId" }, { status: 400 })

    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 })

    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
      select: { id: true, artist_id: true, title: true, description: true, medium: true, style: true, subject: true, tags: true },
    })
    if (!artwork) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 })

    const role = session.user.role ?? "user"
    const isOwner = artwork.artist_id === session.user.id
    const isAdmin = role === "admin" || role === "super_admin"
    if (!isOwner && !isAdmin) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 })

    const text = [artwork.title, artwork.description ?? "", artwork.medium ?? "", artwork.style ?? "", artwork.subject ?? "", artwork.tags.join(", ")]
      .filter(Boolean)
      .join("\n")

    const embedding = await embedText(text)
    if (!embedding) return NextResponse.json({ ok: false, error: "embedding failed" }, { status: 500 })

    await prisma.$executeRawUnsafe(
      `UPDATE artworks SET embedding = $1::vector WHERE id = $2`,
      JSON.stringify(embedding),
      artworkId,
    )

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 })
  }
}
