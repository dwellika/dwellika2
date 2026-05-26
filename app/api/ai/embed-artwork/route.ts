import { NextResponse, type NextRequest } from "next/server"

import { embedText, isOpenAIConfigured } from "@/lib/ai/openai"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        { ok: false, error: "OPENAI_API_KEY missing" },
        { status: 503 },
      )
    }
    const { artworkId } = (await request.json()) as { artworkId?: string }
    if (!artworkId) return NextResponse.json({ ok: false, error: "Missing artworkId" }, { status: 400 })

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 })

    // Only artist (or admin) can re-embed their own artwork
    const { data: artwork } = await supabase
      .from("artworks")
      .select("id, artist_id, title, description, medium, style, subject, tags, ai_tags")
      .eq("id", artworkId)
      .maybeSingle()
    const row = artwork as
      | {
          id: string
          artist_id: string
          title: string
          description: string | null
          medium: string | null
          style: string | null
          subject: string | null
          tags: string[]
          ai_tags: Record<string, unknown>
        }
      | null
    if (!row) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 })

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()
    const role = (profile as { role?: string } | null)?.role
    const isOwner = row.artist_id === user.id
    const isAdmin = role === "admin" || role === "super_admin"
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 })
    }

    const text = [
      row.title,
      row.description ?? "",
      row.medium ?? "",
      row.style ?? "",
      row.subject ?? "",
      (row.tags ?? []).join(", "),
    ]
      .filter(Boolean)
      .join("\n")
    const embedding = await embedText(text)
    if (!embedding) {
      return NextResponse.json({ ok: false, error: "embedding failed" }, { status: 500 })
    }

    const admin = createAdminClient()
    await admin
      .from("artworks")
      .update({ embedding: embedding as unknown as string })
      .eq("id", artworkId)

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    )
  }
}
