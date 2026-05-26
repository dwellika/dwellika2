import { NextResponse, type NextRequest } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

import type { Database } from "@/lib/types/database"

type CookieRecord = { name: string; value: string; options?: CookieOptions }

type AppRole = "super_admin" | "admin" | "artist" | "seller" | "user"

const ROLE_GATED_PREFIXES: Array<{ prefix: string; allow: AppRole[] }> = [
  { prefix: "/admin", allow: ["admin", "super_admin"] },
  { prefix: "/artist/dashboard", allow: ["artist", "admin", "super_admin"] },
  { prefix: "/seller/dashboard", allow: ["seller", "admin", "super_admin"] },
]

const AUTH_REQUIRED_PREFIXES = ["/settings", "/checkout", "/orders", "/messages"]

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieRecord[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANT: do not put logic between createServerClient and getUser.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  const requiresAuth = AUTH_REQUIRED_PREFIXES.some((p) => path.startsWith(p))
  const gate = ROLE_GATED_PREFIXES.find((g) => path.startsWith(g.prefix))

  if (!user && (requiresAuth || gate)) {
    const signInUrl = request.nextUrl.clone()
    signInUrl.pathname = "/signin"
    signInUrl.searchParams.set("next", path)
    return NextResponse.redirect(signInUrl)
  }

  if (user && gate) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const role = (profile?.role as AppRole | undefined) ?? "user"
    if (!gate.allow.includes(role)) {
      const forbiddenUrl = request.nextUrl.clone()
      forbiddenUrl.pathname = "/403"
      return NextResponse.redirect(forbiddenUrl)
    }
  }

  return response
}
