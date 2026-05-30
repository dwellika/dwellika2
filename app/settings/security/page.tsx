"use client"

import { useState, useTransition } from "react"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

import { changePassword } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-6">
      <ChangePasswordCard />
      <TwoFactorCard />
    </div>
  )
}

function ChangePasswordCard() {
  const [pending, startTransition] = useTransition()
  const [error, setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          If you signed in with Google or GitHub, you can set a password here to also enable email sign-in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={(fd) =>
            startTransition(async () => {
              setError(null); setSuccess(false)
              const r = await changePassword(fd)
              if (r.ok) {
                setSuccess(true)
                toast.success("Password updated.")
                ;(document.querySelector("form") as HTMLFormElement | null)?.reset()
              } else {
                setError(r.error)
              }
            })
          }
          className="max-w-md space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="current_password">Current password</Label>
            <div className="relative">
              <Input
                id="current_password"
                name="current_password"
                type={showCurrent ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Leave blank if signing in via OAuth only"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowCurrent((p) => !p)}
                aria-label={showCurrent ? "Hide" : "Show"}
              >
                {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password">New password</Label>
            <div className="relative">
              <Input
                id="new_password"
                name="new_password"
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowNew((p) => !p)}
                aria-label={showNew ? "Hide" : "Show"}
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm new password</Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Repeat new password"
            />
          </div>

          {error   && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-emerald-500">Password updated successfully.</p>}

          <Button type="submit" disabled={pending}>
            {pending ? "Updating…" : "Update password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function TwoFactorCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-factor authentication</CardTitle>
        <CardDescription>Add a second layer of protection to your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Authenticator-app 2FA is coming soon. You&apos;ll be notified when it&apos;s available.
        </p>
      </CardContent>
    </Card>
  )
}
