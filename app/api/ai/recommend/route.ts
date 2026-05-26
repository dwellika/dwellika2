import { NextResponse, type NextRequest } from "next/server"

import { embedText, isOpenAIConfigured } from "@/lib/ai/openai"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

/**
 * Recommendations are derived from the user's saved artworks: we embed
 * their interest signal (titles + tags concatenated) and find similar
 * artworks they haven't already saved or liked.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 })
    }
    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        { ok: false, error: "OPENAI_API_KEY missing" },
        { status: 503 },
      )
    }

    // Pull recent saved/liked artworks
    const { data: signals } = await supabase
      .from("saves")
      .select("target_id, target_kind")
      .eq("user_id", user.id)
      .eq("target_kind", "artwork")
      .order("created_at", { ascending: false })
      .limit(20)

    const ids = ((signals ?? []) as { target_id: string }[]).map((s) => s.target_id)
    if (ids.length === 0) {
      return NextResponse.json({ ok: true, results: [] })
    }

    const { data: items } = await supabase
      .from("artworks")
      .select("title, medium, style, subject, tags")
      .in("id", ids)
      .limit(20)

    const text =
      ((items ?? []) as Array<{
        title: string
        medium: string | null
        style: string | null
        subject: string | null
        tags: string[]
      }>)
        .map(
          (a) =>
            `${a.title} — ${a.medium ?? ""} ${a.style ?? ""} ${a.subject ?? ""} ${(a.tags ?? []).join(" ")}`,
        )
        .join("\n")

    const embedding = await embedText(text)
    if (!embedding) {
      return NextResponse.json({ ok: false, error: "embed failed" }, { status: 500 })
    }

    const { data: matches, error } = await supabase.rpc("search_artworks", {
      query_embedding: embedding as unknown as string,
      match_count: 16,
      match_threshold: 0.15,
    })
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    // Filter out artworks already saved
    const savedSet = new Set(ids)
    const results = ((matches ?? []) as Array<{ id: string }>).filter(
      (m) => !savedSet.has(m.id),
    )

    return NextResponse.json({ ok: true, results })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    )
  }
}
