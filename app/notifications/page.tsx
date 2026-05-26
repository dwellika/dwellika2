import Link from "next/link"
import { Bell } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { requireAuth } from "@/lib/auth/rbac"
import { listNotifications } from "@/lib/data/notifications"

import { MarkAllReadButton } from "./MarkAllReadButton"
import { NotificationItem } from "./NotificationItem"

export const metadata = { title: "Notifications" }

export default async function NotificationsPage() {
  const user = await requireAuth()
  const items = await listNotifications(user.id, { limit: 60 })
  const unread = items.filter((i) => !i.read_at).length

  return (
    <div className="container-page py-12">
      <header className="mb-8 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Inbox</p>
          <h1 className="font-display text-4xl">
            Notifications {unread > 0 ? <span className="text-muted-foreground">· {unread} unread</span> : null}
          </h1>
        </div>
        {unread > 0 ? <MarkAllReadButton /> : null}
      </header>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="mx-auto size-10 text-muted-foreground" />
            <p className="mt-3 font-display text-xl">All caught up</p>
            <p className="mt-1 text-sm text-muted-foreground">
              You&apos;ll see likes, follows, mentions, and order updates here.
            </p>
            <Link href="/" className="mt-4 inline-block text-sm text-primary hover:underline">
              Back to the gallery
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </ul>
      )}
    </div>
  )
}
