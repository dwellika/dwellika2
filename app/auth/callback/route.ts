import { NextResponse, type NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  if (error) {
    const target = new URL("/signin", origin)
    target.searchParams.set("error", errorDescription ?? error)
    return NextResponse.redirect(target)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) {
      const target = new URL("/signin", origin)
      target.searchParams.set("error", exchangeError.message)
      return NextResponse.redirect(target)
    }
  }

  return NextResponse.redirect(new URL(next, origin))
}
