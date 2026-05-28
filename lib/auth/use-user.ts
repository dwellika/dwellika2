"use client"

import { useSession } from "next-auth/react"
import type { AppRole } from "@/lib/types/database"

export interface ClientUser {
  id: string
  email: string | null
  role: AppRole
  username: string | null
  full_name: string | null
  avatar_url: string | null
}

export function useUser() {
  const { data: session, status } = useSession()

  const user: ClientUser | null = session?.user?.id
    ? {
        id: session.user.id,
        email: session.user.email ?? null,
        role: (session.user.role as AppRole) ?? "user",
        username: session.user.username ?? null,
        full_name: session.user.full_name ?? null,
        avatar_url: session.user.avatar_url ?? null,
      }
    : null

  return { user, loading: status === "loading" }
}
