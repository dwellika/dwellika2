import Link from "next/link"
import { MessageSquare } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { requireAuth } from "@/lib/auth/rbac"
import { listMyChats } from "@/lib/data/chat"

export const metadata = { title: "Messages" }

export default async function MessagesInboxPage() {
  const user = await requireAuth()
  const chats = await listMyChats(user.id)

  if (chats.length === 0) {
    return (
      <div className="container-page py-20">
        <div className="mx-auto max-w-md text-center">
          <MessageSquare className="mx-auto size-12 text-muted-foreground" />
          <h1 className="mt-4 font-display text-3xl">No messages yet</h1>
          <p className="mt-2 text-muted-foreground">
            Start a conversation with an artist from their profile, or message a
            seller from an order.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-page py-12">
      <h1 className="mb-8 font-display text-4xl">Messages</h1>
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {chats.map((c) => (
            <Link
              key={c.chat_id}
              href={`/messages/${c.chat_id}`}
              className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/30"
            >
              <Avatar className="size-12">
                <AvatarImage src={c.other?.avatar_url ?? undefined} />
                <AvatarFallback>
                  {(c.other?.full_name ?? c.other?.username ?? c.chat.title ?? "?")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="line-clamp-1 font-medium">
                    {c.chat.kind === "order"
                      ? "Order discussion"
                      : c.other?.full_name ?? `@${c.other?.username}`}
                  </p>
                  {c.unread > 0 ? <Badge>{c.unread}</Badge> : null}
                </div>
                <p className="line-clamp-1 text-sm text-muted-foreground">
                  {c.last_message?.body ?? "(no messages yet)"}
                </p>
              </div>
              {c.last_message ? (
                <p className="shrink-0 text-xs text-muted-foreground">
                  {new Date(c.last_message.created_at).toLocaleDateString()}
                </p>
              ) : null}
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
