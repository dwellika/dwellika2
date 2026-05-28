import "server-only"

import { cache } from "react"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/config"
import type { AppRole } from "@/lib/types/database"

export interface AuthedUser {
  id: string
  email: string | null
  role: AppRole
  username: string | null
  full_name: string | null
  avatar_url: string | null
  is_verified: boolean
}

// Wrapped with React cache() — deduplicates multiple auth() calls within
// a single React render tree (e.g. generateMetadata + page component).
export const getCurrentUser = cache(async (): Promise<AuthedUser | null> => {
  const session = await auth()
  if (!session?.user?.id) return null

  return {
    id: session.user.id,
    email: session.user.email ?? null,
    role: session.user.role ?? "user",
    username: session.user.username ?? null,
    full_name: session.user.full_name ?? null,
    avatar_url: session.user.avatar_url ?? null,
    is_verified: session.user.is_verified ?? false,
  }
})

/** Redirects to /signin if not authenticated. */
export async function requireAuth(redirectTo = "/signin"): Promise<AuthedUser> {
  const user = await getCurrentUser()
  if (!user) redirect(redirectTo)
  return user
}

/** Redirects to /signin (unauthenticated) or /403 (wrong role) if not permitted. */
export async function requireRole(...allow: AppRole[]): Promise<AuthedUser> {
  const user = await getCurrentUser()
  if (!user) redirect("/signin")
  if (!allow.includes(user.role)) redirect("/403")
  return user
}

/** Redirects to /403 if the caller is not the target user or an admin. */
export async function requireSelf(targetUserId: string): Promise<AuthedUser> {
  const user = await getCurrentUser()
  if (!user) redirect("/signin")
  if (user.id !== targetUserId && !isPrivilegedRole(user.role)) redirect("/403")
  return user
}

export function isPrivilegedRole(role: AppRole): boolean {
  return role === "admin" || role === "super_admin"
}

export function canModerate(role: AppRole): boolean {
  return role === "admin" || role === "super_admin"
}

export function isCreatorRole(role: AppRole): boolean {
  return role === "artist" || role === "seller" || isPrivilegedRole(role)
}
