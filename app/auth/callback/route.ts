import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const next = searchParams.get("next") ?? "/"
  const error = searchParams.get("error")

  if (error) {
    const target = new URL("/signin", origin)
    target.searchParams.set("error", searchParams.get("error_description") ?? error)
    return NextResponse.redirect(target)
  }

  return NextResponse.redirect(new URL(next, origin))
}
