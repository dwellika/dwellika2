import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"

const edgeAuthConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/signin", error: "/signin" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as Record<string, unknown>).role as string ?? "user"
        token.username = (user as Record<string, unknown>).username as string | null ?? null
        token.full_name = (user as Record<string, unknown>).full_name as string | null ?? null
        token.avatar_url = (user as Record<string, unknown>).avatar_url as string | null ?? null
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = (token.role as string) ?? "user"
      session.user.username = (token.username as string | null) ?? null
      session.user.full_name = (token.full_name as string | null) ?? null
      session.user.avatar_url = (token.avatar_url as string | null) ?? null
      return session
    },
  },
}

export const { auth } = NextAuth(edgeAuthConfig)
