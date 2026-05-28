import { NextResponse, type NextRequest } from "next/server"
import { signOut } from "@/lib/auth/config"

export async function POST(request: NextRequest) {
  await signOut({ redirect: false })
  return NextResponse.redirect(new URL("/", request.url), { status: 303 })
}
