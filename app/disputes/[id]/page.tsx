import { notFound } from "next/navigation"
import Link from "next/link"
import { Paperclip } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { requireAuth, isPrivilegedRole } from "@/lib/auth/rbac"
import { getDispute, listDisputeMessages } from "@/lib/data/disputes"

import { DisputeComposer } from "./DisputeComposer"

interface PageProps {
  params: Promise<{ id: string }>
}

const STATUS_TONE: Record<string, string> = {
  open: "bg-amber-500/20 text-amber-300",
  reviewing: "bg-blue-500/20 text-blue-300",
  resolved: "bg-emerald-500/20 text-emerald-300",
  rejected: "bg-red-500/20 text-red-300",
}

export default async function DisputePage({ params }: PageProps) {
  const { id } = await params
  const user = await requireAuth()
  const dispute = await getDispute(id, user.id, isPrivilegedRole(user.role))
  if (!dispute) notFound()
  const messages = await listDisputeMessages(id)

  return (
    <div className="container-page py-12">
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Dispute</p>
          <h1 className="font-display text-4xl">{dispute.reason}</h1>
          <p className="text-xs text-muted-foreground">
            Opened {new Date(dispute.created_at).toLocaleString()}{" "}
            {dispute.order ? (
              <>
                ·{" "}
                <Link href={`/orders/${dispute.order.id}`} className="hover:text-foreground">
                  Order {dispute.order.order_number}
                </Link>
              </>
            ) : null}
          </p>
        </div>
        <Badge className={`capitalize ${STATUS_TONE[dispute.status]}`}>{dispute.status}</Badge>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          {dispute.description ? (
            <Card>
              <CardHeader>
                <CardTitle>What happened</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm">{dispute.description}</p>
                {Array.isArray(dispute.evidence) && dispute.evidence.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(dispute.evidence as Array<{ url: string; name?: string }>).map((e, i) => (
                      <a
                        key={i}
                        href={e.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted/40"
                      >
                        <Paperclip className="size-3" /> {e.name ?? "Evidence"}
                      </a>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {dispute.resolution ? (
            <Card>
              <CardHeader>
                <CardTitle>Resolution</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm">{dispute.resolution}</p>
                {dispute.resolved_at ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Resolved {new Date(dispute.resolved_at).toLocaleString()}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">No messages yet.</p>
              ) : (
                messages.map((m) => {
                  const isOwn = m.sender_id === user.id
                  return (
                    <div key={m.id} className="flex gap-3">
                      <Avatar className="size-8">
                        <AvatarImage src={m.sender?.avatar_url ?? undefined} />
                        <AvatarFallback>
                          {(m.sender?.full_name ?? m.sender?.username ?? "?").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm">
                          <span className="font-medium">
                            {m.sender?.full_name ?? `@${m.sender?.username}`}
                          </span>
                          {isOwn ? <span className="text-muted-foreground"> · you</span> : null}
                        </p>
                        <p className="mt-0.5 whitespace-pre-line text-sm">{m.body}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {new Date(m.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <Separator />
              <DisputeComposer disputeId={dispute.id} />
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardContent className="space-y-2 p-5 text-sm">
              <h3 className="font-display text-base">Process</h3>
              <p className="text-muted-foreground">
                1. Buyer opens dispute with evidence.<br />
                2. Seller responds within 72 hours.<br />
                3. Dwellika team mediates if no agreement.<br />
                4. Resolution within 5 business days.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
