import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { requireAuth } from "@/lib/auth/rbac"
import { getChat, listMessages } from "@/lib/data/chat"

import { ChatThread } from "./ChatThread"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ChatPage({ params }: PageProps) {
  const { id } = await params
  const user = await requireAuth()
  const chatData = await getChat(id, user.id)
  if (!chatData) notFound()

  const messages = await listMessages(id, { limit: 200 })
  const others = chatData.participants.filter((p) => p.user_id !== user.id)
  const other = others[0]?.user ?? null

  return (
    <div className="container-page py-6 md:py-10">
      <div className="mb-4 flex items-center gap-3">
        <Link
          href="/messages"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Inbox
        </Link>
      </div>

      <Card className="overflow-hidden">
        <header className="flex items-center gap-3 border-b border-border p-4">
          {chatData.chat.kind === "order" ? (
            <>
              <div className="grid size-10 place-items-center rounded-full bg-primary/15 text-primary">
                📦
              </div>
              <div>
                <p className="font-medium">Order discussion</p>
                {chatData.chat.order_id ? (
                  <Link
                    href={`/orders/${chatData.chat.order_id}`}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    View order →
                  </Link>
                ) : null}
              </div>
            </>
          ) : other ? (
            <Link href={`/u/${other.username}`} className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarImage src={other.avatar_url ?? undefined} />
                <AvatarFallback>{(other.full_name ?? other.username ?? "?").slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{other.full_name ?? `@${other.username}`}</p>
                <p className="text-xs text-muted-foreground">@{other.username}</p>
              </div>
            </Link>
          ) : null}
        </header>

        <CardContent className="p-0">
          <ChatThread
            chatId={id}
            currentUserId={user.id}
            initialMessages={messages}
            participants={chatData.participants.map((p) => ({
              id: p.user_id,
              username: p.user?.username ?? null,
              full_name: p.user?.full_name ?? null,
              avatar_url: p.user?.avatar_url ?? null,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  )
}
