"use client"

import { useEffect, useState } from "react"

import { createClient } from "@/lib/supabase/client"
import type { AppRole } from "@/lib/types/database"

export interface ClientUser {
  id: string
  email: string | null
  role: AppRole
  username: string | null
  full_name: string | null
  avatar_url: string | null
}

/**
 * Lightweight client-side user hook. Listens to Supabase auth state
 * changes and refetches the profile row on sign-in.
 */
export function useUser() {
  const [user, setUser] = useState<ClientUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    const load = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        if (!cancelled) {
          setUser(null)
          setLoading(false)
        }
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, username, full_name, avatar_url")
        .eq("id", authUser.id)
        .single<{
          role: AppRole
          username: string | null
          full_name: string | null
          avatar_url: string | null
        }>()

      if (cancelled) return

      setUser({
        id: authUser.id,
        email: authUser.email ?? null,
        role: profile?.role ?? "user",
        username: profile?.username ?? null,
        full_name: profile?.full_name ?? null,
        avatar_url: profile?.avatar_url ?? null,
      })
      setLoading(false)
    }

    load()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      load()
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}
