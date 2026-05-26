import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { requireRole } from "@/lib/auth/rbac"
import { createAdminClient } from "@/lib/supabase/admin"

import { ResolveControls } from "./ResolveControls"

export const metadata = { title: "Admin · Disputes" }

const TONE: Record<string, string> = {
  open: "bg-amber-500/20 text-amber-300",
  reviewing: "bg-blue-500/20 text-blue-300",
  resolved: "bg-emerald-500/20 text-emerald-300",
  rejected: "bg-red-500/20 text-red-300",
}

export default async function AdminDisputesPage() {
  await requireRole("admin", "super_admin")
  const admin = createAdminClient()

  const { data } = await admin
    .from("disputes")
    .select(
      `
        id, order_id, reason, description, status, created_at,
        opener:profiles!disputes_opened_by_fkey ( username, full_name, avatar_url ),
        against:profiles!disputes_against_id_fkey ( username, full_name, avatar_url ),
        order:orders!disputes_order_id_fkey ( order_number, total, currency )
      `,
    )
    .order("created_at", { ascending: false })

  const rows =
    (data ?? []) as unknown as Array<{
      id: string
      order_id: string
      reason: string
      description: string | null
      status: string
      created_at: string
      opener: { username: string | null; full_name: string | null; avatar_url: string | null } | null
      against: { username: string | null; full_name: string | null; avatar_url: string | null } | null
      order: { order_number: string; total: number; currency: string } | null
    }>

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl">Disputes</h1>
        <p className="mt-1 text-muted-foreground">Mediate cases between buyers and sellers.</p>
      </header>

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {rows.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">
              No disputes currently.
            </p>
          ) : null}
          {rows.map((d) => (
            <div key={d.id} className="grid gap-3 p-4 md:grid-cols-[1fr_140px_220px]">
              <div className="min-w-0">
                <Link href={`/disputes/${d.id}`} className="font-medium hover:underline">
                  {d.reason}
                </Link>
                <p className="line-clamp-1 text-xs text-muted-foreground">{d.description ?? ""}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Avatar className="size-5">
                      <AvatarImage src={d.opener?.avatar_url ?? undefined} />
                      <AvatarFallback>{(d.opener?.full_name ?? "?").slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    @{d.opener?.username}
                  </span>
                  vs
                  <span className="inline-flex items-center gap-1">
                    <Avatar className="size-5">
                      <AvatarImage src={d.against?.avatar_url ?? undefined} />
                      <AvatarFallback>{(d.against?.full_name ?? "?").slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    @{d.against?.username}
                  </span>
                  · {d.order?.order_number}
                </div>
              </div>
              <Badge className={`h-fit capitalize ${TONE[d.status]}`}>{d.status}</Badge>
              {d.status !== "resolved" && d.status !== "rejected" ? (
                <ResolveControls disputeId={d.id} />
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
