"use client"

import Link from "next/link"
import { useState, useTransition } from "react"

import { requestPasswordReset } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <Card className="glass">
      <CardHeader className="text-center">
        <CardTitle className="font-display text-3xl">Reset password</CardTitle>
        <CardDescription>
          We&apos;ll email you a link to set a new password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {sent ? (
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
            <p className="font-medium">Check your inbox.</p>
            <p className="mt-1 text-muted-foreground">
              If an account exists for that email, a reset link is on its way.
            </p>
          </div>
        ) : (
          <form
            action={(fd) =>
              startTransition(async () => {
                setError(null)
                const result = await requestPasswordReset(fd)
                if (result.ok) setSent(true)
                else setError(result.error)
              })
            }
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@studio.art"
              />
            </div>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link href="/signin" className="text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
