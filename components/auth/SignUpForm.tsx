"use client"

import { useState, useTransition } from "react"

import { signUpWithPassword } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [pending, startTransition] = useTransition()

  if (success) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
        <p className="font-medium">Almost there.</p>
        <p className="mt-1 text-muted-foreground">
          We sent a confirmation link to your inbox. Open it to finish creating
          your Dwellika account.
        </p>
      </div>
    )
  }

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          setError(null)
          const result = await signUpWithPassword(fd)
          if (result && result.ok) {
            setSuccess(true)
          } else if (result) {
            setError(result.error)
          }
        })
      }
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          required
          placeholder="Mira Sen"
        />
      </div>

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

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>

      <div className="flex items-start gap-2">
        <Checkbox
          id="terms"
          checked={agreed}
          onCheckedChange={(v) => setAgreed(v === true)}
        />
        <Label htmlFor="terms" className="text-sm leading-snug text-muted-foreground">
          I agree to the{" "}
          <a className="text-foreground underline" href="/terms">
            Terms of Service
          </a>{" "}
          and{" "}
          <a className="text-foreground underline" href="/privacy">
            Privacy Policy
          </a>
          .
        </Label>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending || !agreed}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  )
}
