import Link from "next/link"
import { ShieldAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { requireAuth } from "@/lib/auth/rbac"
import { listMyDisputes } from "@/lib/data/disputes"

export const metadata = { title: "My disputes" }

const STATUS_TONE: Record<string, string> = {
  open: "bg-amber-500/20 text-amber-300",
  reviewing: "bg-blue-500/20 text-blue-300",
  resolved: "bg-emerald-500/20 text-emerald-300",
  rejected: "bg-red-500/20 text-red-300",
}

export default async function MyDisputesPage() {
  const user = await requireAuth()
  const disputes = await listMyDisputes(user.id)

  if (disputes.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <ShieldAlert className="mx-auto size-12 text-muted-foreground" />
        <h1 className="mt-4 font-display text-3xl">No disputes</h1>
        <p className="mt-2 text-muted-foreground">
          If something goes wrong with an order, you can open a dispute from the
          order details page.
        </p>
      </div>
    )
  }

  return (
    <div className="container-page py-12">
      <h1 className="mb-8 font-display text-4xl">My disputes</h1>
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {disputes.map((d) => (
            <Link
              key={d.id}
              href={`/disputes/${d.id}`}
              className="grid items-center gap-3 p-4 transition-colors hover:bg-muted/30 md:grid-cols-[minmax(0,1fr)_120px_140px]"
            >
              <div className="min-w-0">
                <p className="line-clamp-1 font-medium">{d.reason}</p>
                <p className="text-xs text-muted-foreground">
                  {d.order?.order_number ?? "—"} · opened{" "}
                  {new Date(d.created_at).toLocaleDateString()}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {d.opened_by === user.id ? "Opened by you" : "Opened against you"}
              </p>
              <Badge className={`capitalize ${STATUS_TONE[d.status]}`}>{d.status}</Badge>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
