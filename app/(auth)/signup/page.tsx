import Link from "next/link"

import { OAuthButtons } from "@/components/auth/OAuthButtons"
import { SignUpForm } from "@/components/auth/SignUpForm"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "Create your account",
  description: "Join Dwellika — the museum-grade art marketplace",
}

export default function SignUpPage() {
  return (
    <Card className="glass">
      <CardHeader className="text-center">
        <CardTitle className="font-display text-3xl">Join Dwellika</CardTitle>
        <CardDescription>
          Create your account to follow artists, collect, and share your work
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <OAuthButtons />

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs uppercase tracking-widest text-muted-foreground">
            or
          </span>
        </div>

        <SignUpForm />

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/signin" className="text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
