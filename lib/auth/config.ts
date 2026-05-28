import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import bcrypt from "bcryptjs"
import { z } from "zod"

import { prisma } from "@/lib/prisma"

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
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true
      if (!user.email) return false

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
        select: { id: true, role: true, username: true, full_name: true, avatar_url: true },
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

      user.id = dbUser.id
        ; (user as Record<string, unknown>).role = dbUser.role
        ; (user as Record<string, unknown>).username = dbUser.username
        ; (user as Record<string, unknown>).full_name = dbUser.full_name
        ; (user as Record<string, unknown>).avatar_url = dbUser.avatar_url

      return true
    },

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

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
