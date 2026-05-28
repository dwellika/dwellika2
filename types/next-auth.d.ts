import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      username: string | null
      full_name: string | null
      avatar_url: string | null
    } & DefaultSession["user"]
  }

  interface User {
    role?: string
    username?: string | null
    full_name?: string | null
    avatar_url?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string
    username?: string | null
    full_name?: string | null
    avatar_url?: string | null
  }
}
