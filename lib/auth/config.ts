import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import bcrypt from "bcryptjs"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import type { AppRole } from "@/lib/types/database"

// Re-read user fields from DB at most once every 15 minutes per session.
// This keeps role/profile changes visible without querying on every request.
const TOKEN_REFRESH_MS = 15 * 60 * 1000

// Only register OAuth providers when credentials are actually configured.
const oauthProviders = []
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  oauthProviders.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  )
}
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  oauthProviders.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  )
}

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = z
          .object({ email: z.string().email(), password: z.string().min(1) })
          .safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            password_hash: true,
            role: true,
            username: true,
            full_name: true,
            avatar_url: true,
            is_verified: true,
          },
        })

        if (!user?.password_hash) return null
        const valid = await bcrypt.compare(password, user.password_hash)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          username: user.username,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          is_verified: user.is_verified,
        }
      },
    }),
    ...oauthProviders,
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true
      if (!user.email) return false

      // OAuth sign-in: upsert user + OAuth account in PostgreSQL
      const dbUser = await prisma.user.upsert({
        where: { email: user.email },
        create: {
          email: user.email,
          full_name: user.name ?? null,
          avatar_url: user.image ?? null,
          email_verified: new Date(),
        },
        update: {
          full_name: user.name ?? undefined,
          avatar_url: user.image ?? undefined,
          email_verified: new Date(),
        },
        select: {
          id: true,
          role: true,
          username: true,
          full_name: true,
          avatar_url: true,
          is_verified: true,
        },
      })

      if (account) {
        await prisma.account.upsert({
          where: {
            provider_provider_account_id: {
              provider: account.provider,
              provider_account_id: account.providerAccountId,
            },
          },
          create: {
            user_id: dbUser.id,
            type: account.type,
            provider: account.provider,
            provider_account_id: account.providerAccountId,
            access_token: account.access_token ?? null,
            refresh_token: account.refresh_token ?? null,
            expires_at: account.expires_at ?? null,
            token_type: account.token_type ?? null,
            scope: account.scope ?? null,
            id_token: account.id_token ?? null,
          },
          update: {
            access_token: account.access_token ?? null,
            refresh_token: account.refresh_token ?? null,
            expires_at: account.expires_at ?? null,
          },
        })
      }

      // Attach DB values onto the NextAuth user object so jwt callback receives them
      user.id = dbUser.id
      user.role = dbUser.role
      user.username = dbUser.username
      user.full_name = dbUser.full_name
      user.avatar_url = dbUser.avatar_url
      user.is_verified = dbUser.is_verified

      return true
    },

    async jwt({ token, user }) {
      // First sign-in: stamp token with all user fields
      if (user) {
        token.id = user.id as string
        token.role = (user.role ?? "user") as AppRole
        token.username = (user.username ?? null) as string | null
        token.full_name = (user.full_name ?? null) as string | null
        token.avatar_url = (user.avatar_url ?? null) as string | null
        token.is_verified = (user.is_verified ?? false) as boolean
        token.refreshAt = Date.now() + TOKEN_REFRESH_MS
        return token
      }

      // Subsequent reads: re-sync from DB once per TOKEN_REFRESH_MS.
      // Propagates role upgrades (artist approval) without forcing re-login.
      const refreshAt = token.refreshAt as number | undefined
      if (token.id && Date.now() > (refreshAt ?? 0)) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              role: true,
              username: true,
              full_name: true,
              avatar_url: true,
              is_verified: true,
            },
          })
          if (dbUser) {
            token.role = dbUser.role as AppRole
            token.username = dbUser.username as string | null
            token.full_name = dbUser.full_name as string | null
            token.avatar_url = dbUser.avatar_url as string | null
            token.is_verified = dbUser.is_verified as boolean
          }
        } catch {
          // DB unreachable — serve stale token data, don't crash
        }
        token.refreshAt = Date.now() + TOKEN_REFRESH_MS
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

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
