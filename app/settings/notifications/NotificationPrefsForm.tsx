"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import { updateNotificationPrefs } from "./actions"
import type { NotificationPrefs } from "./types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

type PrefKey = keyof NotificationPrefs

const BELL_ROWS: Array<{ key: PrefKey; label: string; desc: string }> = [
  { key: "bell_likes",    label: "Likes",         desc: "When someone likes your artwork or reel"   },
  { key: "bell_comments", label: "Comments",      desc: "New comments on your content"              },
  { key: "bell_follows",  label: "Follows",       desc: "When someone starts following you"         },
  { key: "bell_messages", label: "Messages",      desc: "New chat messages"                         },
  { key: "bell_orders",   label: "Order updates", desc: "Purchases, shipping, and delivery updates" },
  { key: "bell_system",   label: "System",        desc: "Announcements and platform updates"        },
]

const EMAIL_ROWS: Array<{ key: PrefKey; label: string }> = [
  { key: "email_comments", label: "Comments"               },
  { key: "email_follows",  label: "New followers"          },
  { key: "email_orders",   label: "Order updates"          },
  { key: "email_system",   label: "System & platform news" },
]

export function NotificationPrefsForm({ initial }: { initial: NotificationPrefs }) {
  const [pending, startTransition] = useTransition()

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          const r = await updateNotificationPrefs(fd)
          if (r.ok) toast.success("Notification preferences saved.")
          else toast.error(r.error)
        })
      }
      className="space-y-6"
    >
      {/* Bell notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Bell notifications</CardTitle>
          <CardDescription>
            Shown in your notification bell. Auto-deleted after 5 days.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {BELL_ROWS.map((row) => (
            <div key={row.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div>
                <Label htmlFor={row.key} className="cursor-pointer font-medium">
                  {row.label}
                </Label>
                <p className="text-xs text-muted-foreground">{row.desc}</p>
              </div>
              <Switch
                id={row.key}
                name={row.key}
                defaultChecked={initial[row.key]}
                value="on"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Email notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Email notifications</CardTitle>
          <CardDescription>Sent to your account email. We never spam.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {EMAIL_ROWS.map((row) => (
            <div key={row.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <Label htmlFor={`e-${row.key}`} className="cursor-pointer font-medium">
                {row.label}
              </Label>
              <Switch
                id={`e-${row.key}`}
                name={row.key}
                defaultChecked={initial[row.key]}
                value="on"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save preferences"}
        </Button>
      </div>
    </form>
  )
}
