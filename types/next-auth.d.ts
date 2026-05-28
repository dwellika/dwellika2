import type { DefaultSession } from "next-auth"
import type { AppRole } from "@/lib/types/database"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: AppRole
      username: string | null
      full_name: string | null
      avatar_url: string | null
      is_verified: boolean
    } & DefaultSession["user"]
  }

  interface User {
    role?: AppRole
    username?: string | null
    full_name?: string | null
    avatar_url?: string | null
    is_verified?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: AppRole
    username?: string | null
    full_name?: string | null
    avatar_url?: string | null
    is_verified?: boolean
    /** Unix ms — token data is refreshed from DB after this timestamp */
    refreshAt?: number
  }
}
