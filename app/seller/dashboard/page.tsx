import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SmartImage } from "@/components/ui/smart-image"
import { requireRole } from "@/lib/auth/rbac"
import { listSellerOrders } from "@/lib/data/orders"

export const metadata = { title: "Seller dashboard" }

export default async function SellerDashboardPage() {
  const user = await requireRole("seller", "admin", "super_admin", "artist")
  const orderItems = await listSellerOrders(user.id)

  const revenue = orderItems.reduce((s, oi) => s + Number(oi.subtotal ?? 0), 0)
  const orderCount = new Set(orderItems.map((oi) => oi.order_id)).size

  return (
    <div className="container-page py-12">
      <h1 className="mb-8 font-display text-4xl">Seller dashboard</h1>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Stat label="Orders" value={orderCount.toString()} />
        <Stat label="Revenue" value={`₹${revenue.toLocaleString()}`} />
        <Stat label="Items sold" value={String(orderItems.reduce((s, oi) => s + oi.quantity, 0))} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orderItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No sales yet — your first order will show up here.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {orderItems.map((oi) => (
                <Link
                  key={oi.id}
                  href={`/orders/${oi.order?.id ?? oi.order_id}`}
                  className="grid items-center gap-3 py-3 md:grid-cols-[56px_minmax(0,1fr)_120px_100px_80px]"
                >
                  <div className="relative size-12 overflow-hidden rounded-md">
                    <SmartImage
                      src={oi.image_url}
                      alt={oi.title}
                      kind="product"
                      seed={oi.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="line-clamp-1 font-medium">{oi.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Order {oi.order?.order_number ?? "—"}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {oi.order?.buyer?.full_name ?? oi.order?.buyer?.username ?? "—"}
                  </p>
                  <Badge variant="outline" className="capitalize">
                    {oi.order?.status ?? "—"}
                  </Badge>
                  <p className="text-right font-display tabular-nums">
                    ₹{Number(oi.subtotal ?? 0).toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-3xl tabular-nums">{value}</p>
      </CardContent>
    </Card>
  )
}
