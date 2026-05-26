import { NextResponse, type NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ ok: false, error: "Email is required." }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email, source: "footer" })

    if (error && error.code !== "23505") {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    )
  }
}
