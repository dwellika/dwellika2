// Edge-safe auth config — no bcryptjs, no Prisma.
// Used ONLY by middleware for JWT verification and route protection.
// The full config (lib/auth/config.ts) handles actual sign-in logic.

import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import type { AppRole } from "@/lib/types/database"

const edgeAuthConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/signin", error: "/signin" },
  providers: [], // No providers needed — middleware only verifies existing tokens
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user.role ?? "user") as AppRole
        token.username = (user.username ?? null) as string | null
        token.full_name = (user.full_name ?? null) as string | null
        token.avatar_url = (user.avatar_url ?? null) as string | null
        token.is_verified = (user.is_verified ?? false) as boolean
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = (token.id as string | undefined) ?? ""
      session.user.role = (token.role as AppRole | undefined) ?? "user"
      session.user.username = (token.username as string | null | undefined) ?? null
      session.user.full_name = (token.full_name as string | null | undefined) ?? null
      session.user.avatar_url = (token.avatar_url as string | null | undefined) ?? null
      session.user.is_verified = (token.is_verified as boolean | undefined) ?? false
      return session
    },
  },
}

export const { auth } = NextAuth(edgeAuthConfig)
