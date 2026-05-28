import "server-only"

import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/config"
import type { AppRole } from "@/lib/types/database"

export interface AuthedUserWithRole {
  id: string
  email: string | null
  role: AppRole
  username: string | null
  full_name: string | null
  avatar_url: string | null
}

export async function getCurrentUser(): Promise<AuthedUserWithRole | null> {
  const session = await auth()
  if (!session?.user?.id) return null

  return {
    id: session.user.id,
    email: session.user.email ?? null,
    role: (session.user.role as AppRole) ?? "user",
    username: session.user.username ?? null,
    full_name: session.user.full_name ?? null,
    avatar_url: session.user.avatar_url ?? null,
  }
}

export async function requireAuth(redirectTo = "/signin"): Promise<AuthedUserWithRole> {
  const user = await getCurrentUser()
  if (!user) redirect(redirectTo)
  return user
}

export async function requireRole(...allow: AppRole[]): Promise<AuthedUserWithRole> {
  const user = await getCurrentUser()
  if (!user) redirect("/signin")
  if (!allow.includes(user.role)) redirect("/403")
  return user
}

export function isPrivilegedRole(role: AppRole): boolean {
  return role === "admin" || role === "super_admin"
}
