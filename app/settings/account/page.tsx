"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { deleteAccount, updateEmail, updateRegionSettings, updateUsername } from "./actions"
import { useUser } from "@/lib/auth/use-user"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी (Hindi)" },
  { value: "bn", label: "বাংলা (Bengali)" },
  { value: "ta", label: "தமிழ் (Tamil)" },
  { value: "te", label: "తెలుగు (Telugu)" },
  { value: "mr", label: "मराठी (Marathi)" },
]

const REGIONS = [
  { value: "IN", label: "India" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "SG", label: "Singapore" },
  { value: "AU", label: "Australia" },
]

export default function AccountSettingsPage() {
  return (
    <div className="space-y-6">
      <UsernameSection />
      <Separator />
      <RegionSection />
      <Separator />
      <EmailSection />
      <Separator />
      <DangerZone />
    </div>
  )
}

function UsernameSection() {
  const { user } = useUser()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Username</CardTitle>
        <CardDescription>Your public handle — used in your profile URL (/u/your-name).</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          key={user?.username ?? "loading"}
          action={(fd) =>
            startTransition(async () => {
              setError(null)
              const r = await updateUsername(fd)
              if (r.ok) toast.success("Username updated.")
              else setError(r.error)
            })
          }
          className="flex max-w-md flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1 space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              required
              defaultValue={user?.username ?? ""}
              pattern="^[a-z0-9_]{3,32}$"
              placeholder="lowercase, numbers, underscore"
            />
          </div>
          <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
        </form>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}

function RegionSection() {
  const [pending, startTransition] = useTransition()
  const [locale, setLocale] = useState("en")
  const [region, setRegion] = useState("IN")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Language & region</CardTitle>
        <CardDescription>Set your preferred language and region.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={() =>
            startTransition(async () => {
              const fd = new FormData()
              fd.set("locale", locale)
              fd.set("region", region)
              const r = await updateRegionSettings(fd)
              if (r.ok) toast.success("Preferences saved.")
              else toast.error(r.error)
            })
          }
          className="flex max-w-md flex-col gap-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={locale} onValueChange={setLocale}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Region</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={pending} className="self-start">
            {pending ? "Saving…" : "Save preferences"}
          </Button>
        </form>
      </CardContent>
    </Card>
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
