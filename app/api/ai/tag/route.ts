import { NextResponse, type NextRequest } from "next/server"

import { getOpenAI, VISION_MODEL, isOpenAIConfigured } from "@/lib/ai/openai"
import { auth } from "@/lib/auth/config"

export const runtime = "nodejs"

const SYSTEM_PROMPT = `You are an art curator. Given an artwork image, return strict JSON with these keys:
{
  "medium": one of [Watercolor, Oil, Acrylic, Charcoal, Graphite, Digital, Mixed Media, Sculpture, Textile, Origami, Other],
  "style": one of [Realism, Impressionism, Abstract, Surrealism, Minimalism, Pop, Folk, Graphic, Other],
  "subject": one of [Portrait, Landscape, Still Life, Figure, Abstract, Architecture, Botanical, Animal, Mythology, Urban, Other],
  "colors": array of 3-5 dominant color names (lowercase, like "indigo", "ochre"),
  "tags": array of 5-10 lowercase tags (concise nouns, no #)
}
Return ONLY the JSON object, no prose, no markdown.`

export async function POST(request: NextRequest) {
  try {
    if (!isOpenAIConfigured()) {
      return NextResponse.json({ ok: false, error: "OPENAI_API_KEY missing" }, { status: 503 })
    }
    const { imageUrl } = (await request.json()) as { imageUrl?: string }
    if (!imageUrl) {
      return NextResponse.json({ ok: false, error: "Missing imageUrl" }, { status: 400 })
    }

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 })
    }

    const client = getOpenAI()
    if (!client) {
      return NextResponse.json({ ok: false, error: "OpenAI not initialised" }, { status: 503 })
    }

    const completion = await client.chat.completions.create({
      model: VISION_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Tag this artwork." },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    })

    const content = completion.choices[0]?.message?.content ?? "{}"
    let parsed: Record<string, unknown> = {}
    try {
      parsed = JSON.parse(content)
    } catch {
      return NextResponse.json({ ok: false, error: "AI returned non-JSON" }, { status: 502 })
    }

    return NextResponse.json({ ok: true, tags: parsed })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    )
  }
}
