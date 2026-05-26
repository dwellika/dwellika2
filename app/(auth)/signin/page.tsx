import Link from "next/link"

import { SignInForm } from "@/components/auth/SignInForm"
import { OAuthButtons } from "@/components/auth/OAuthButtons"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface SignInPageProps {
  searchParams: Promise<{
    next?: string
    error?: string
    reset?: string
  }>
}

export const metadata = {
  title: "Sign in",
  description: "Sign in to your Dwellika account",
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { next = "/", error, reset } = await searchParams

  return (
    <Card className="glass">
      <CardHeader className="text-center">
        <CardTitle className="font-display text-3xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to continue curating your gallery
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {reset === "ok" ? (
          <p className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-300">
            Password updated. You can sign in with your new password.
          </p>
        ) : null}
        {error ? (
          <p
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {decodeURIComponent(error)}
          </p>
        ) : null}

        <OAuthButtons next={next} />

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs uppercase tracking-widest text-muted-foreground">
            or
          </span>
        </div>

        <SignInForm next={next} />

        <p className="text-center text-sm text-muted-foreground">
          New to Dwellika?{" "}
          <Link href="/signup" className="text-foreground hover:underline">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
