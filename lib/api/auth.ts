import "server-only"

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import type { AppRole } from "@/lib/types/database"

export interface ApiSession {
  userId: string
  role: AppRole
  email: string | null
  is_verified: boolean
}

/** Resolves the session from JWT — no DB query. */
export async function getApiSession(): Promise<ApiSession | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  return {
    userId: session.user.id,
    role: session.user.role ?? "user",
    email: session.user.email ?? null,
    is_verified: session.user.is_verified ?? false,
  }
}

/** Returns the session, or a 401 Response. Use with isApiSession() to narrow. */
export async function requireApiAuth(): Promise<ApiSession | NextResponse> {
  const s = await getApiSession()
  if (!s) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  return s
}

/** Returns the session if role matches, or 401/403 Response. */
export async function requireApiRole(
  ...roles: AppRole[]
): Promise<ApiSession | NextResponse> {
  const s = await getApiSession()
  if (!s) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  if (!roles.includes(s.role))
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 })
  return s
}

/** Type guard — narrows the union returned by requireApiAuth / requireApiRole. */
export function isApiSession(v: ApiSession | NextResponse): v is ApiSession {
  return !(v instanceof NextResponse)
}
