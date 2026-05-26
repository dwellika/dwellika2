import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { requireRole } from "@/lib/auth/rbac"
import { createAdminClient } from "@/lib/supabase/admin"

export const metadata = { title: "Admin · Orders" }

const TONE: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-300",
  confirmed: "bg-blue-500/20 text-blue-300",
  processing: "bg-blue-500/20 text-blue-300",
  shipped: "bg-purple-500/20 text-purple-300",
  delivered: "bg-emerald-500/20 text-emerald-300",
  cancelled: "bg-red-500/20 text-red-300",
  returned: "bg-orange-500/20 text-orange-300",
}

export default async function AdminOrdersPage() {
  await requireRole("admin", "super_admin")
  const admin = createAdminClient()

  const { data } = await admin
    .from("orders")
    .select(
      `id, order_number, status, total, currency, created_at, buyer:profiles!orders_buyer_id_fkey(username, full_name)`,
    )
    .order("created_at", { ascending: false })
    .limit(80)

  const rows =
    (data ?? []) as unknown as Array<{
      id: string
      order_number: string
      status: string
      total: number
      currency: string
      created_at: string
      buyer: { username: string | null; full_name: string | null } | null
    }>

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl">Orders</h1>
        <p className="mt-1 text-muted-foreground">All orders across the platform.</p>
      </header>

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {rows.map((o) => (
            <Link
              key={o.id}
              href={`/orders/${o.id}`}
              className="grid items-center gap-3 p-3 transition-colors hover:bg-muted/30 md:grid-cols-[1fr_180px_140px_140px]"
            >
              <div>
                <p className="font-medium">{o.order_number}</p>
                <p className="text-xs text-muted-foreground">
                  {o.buyer?.full_name ?? `@${o.buyer?.username}`}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(o.created_at).toLocaleString()}
              </p>
              <Badge className={`w-fit capitalize ${TONE[o.status]}`}>{o.status}</Badge>
              <p className="font-display text-base tabular-nums">
                {o.currency} {Number(o.total).toLocaleString()}
              </p>
            </Link>
          ))}
          {rows.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">No orders yet.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
