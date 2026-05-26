import "server-only"

import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import type { AppRole } from "@/lib/types/database"

export interface AuthedUserWithRole {
  id: string
  email: string | null
  role: AppRole
  username: string | null
  full_name: string | null
  avatar_url: string | null
}

/**
 * Returns the currently authenticated user along with their role from
 * the profiles table. Returns null if not authenticated.
 *
 * Use `requireAuth` / `requireRole` for guard semantics.
 */
export async function getCurrentUser(): Promise<AuthedUserWithRole | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, username, full_name, avatar_url")
    .eq("id", user.id)
    .single<{
      role: AppRole
      username: string | null
      full_name: string | null
      avatar_url: string | null
    }>()

  return {
    id: user.id,
    email: user.email ?? null,
    role: profile?.role ?? "user",
    username: profile?.username ?? null,
    full_name: profile?.full_name ?? null,
    avatar_url: profile?.avatar_url ?? null,
  }
}

export async function requireAuth(redirectTo = "/signin"): Promise<AuthedUserWithRole> {
  const user = await getCurrentUser()
  if (!user) redirect(redirectTo)
  return user
}

/**
 * Guard a server component / server action / route handler. Redirects
 * to /signin if unauthenticated and /403 if the user's role isn't in
 * the allow list.
 */
export async function requireRole(
  ...allow: AppRole[]
): Promise<AuthedUserWithRole> {
  const user = await getCurrentUser()
  if (!user) redirect("/signin")
  if (!allow.includes(user.role)) redirect("/403")
  return user
}

export function isPrivilegedRole(role: AppRole): boolean {
  return role === "admin" || role === "super_admin"
}
