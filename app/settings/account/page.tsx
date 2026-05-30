"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { deleteAccount, updateEmail } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function AccountSettingsPage() {
  return (
    <div className="space-y-6">
      <EmailSection />
      <Separator />
      <DangerZone />
    </div>
  )
}

function EmailSection() {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email address</CardTitle>
        <CardDescription>
          Change the email used to sign in. Enter your current password to confirm.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={(fd) =>
            startTransition(async () => {
              setError(null); setSuccess(false)
              const r = await updateEmail(fd)
              if (r.ok) { setSuccess(true); toast.success("Email updated.") }
              else setError(r.error)
            })
          }
          className="max-w-md space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email">New email address</Label>
            <Input id="email" name="email" type="email" required placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-password">Current password</Label>
            <Input id="email-password" name="password" type="password" placeholder="Required if you have a password" />
          </div>
          {error   && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-emerald-500">Email updated successfully.</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Update email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function DangerZone() {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-destructive">Danger zone</CardTitle>
        <CardDescription>
          Permanently delete your account and all your content. This cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!open ? (
          <Button variant="destructive" onClick={() => setOpen(true)}>
            Delete my account
          </Button>
        ) : (
          <form
            action={(fd) =>
              startTransition(async () => {
                setError(null)
                const r = await deleteAccount(fd)
                if (r && !r.ok) setError(r.error)
              })
            }
            className="max-w-md space-y-4"
          >
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
              This will permanently delete your account, artworks, products, reels, and all associated data.
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmation">
                Type <strong>delete my account</strong> to confirm
              </Label>
              <Input id="confirmation" name="confirmation" required autoComplete="off" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="del-password">Current password</Label>
              <Input id="del-password" name="password" type="password" placeholder="Required if you have a password" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" variant="destructive" disabled={pending}>
                {pending ? "Deleting…" : "Delete permanently"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setOpen(false); setError(null) }}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
