import Link from "next/link"
import { Package } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SmartImage } from "@/components/ui/smart-image"
import { requireAuth } from "@/lib/auth/rbac"
import { listMyOrders } from "@/lib/data/orders"

export const metadata = { title: "My orders" }

const STATUS_TONE: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-300",
  confirmed: "bg-blue-500/20 text-blue-300",
  processing: "bg-blue-500/20 text-blue-300",
  shipped: "bg-purple-500/20 text-purple-300",
  delivered: "bg-emerald-500/20 text-emerald-300",
  cancelled: "bg-red-500/20 text-red-300",
  returned: "bg-orange-500/20 text-orange-300",
}

export default async function OrdersPage() {
  const user = await requireAuth()
  const orders = await listMyOrders(user.id)

  if (orders.length === 0) {
    return (
      <div className="container-page py-20">
        <div className="mx-auto max-w-md text-center">
          <Package className="mx-auto size-12 text-muted-foreground" />
          <h1 className="mt-4 font-display text-3xl">No orders yet</h1>
          <p className="mt-2 text-muted-foreground">
            When you check out, your orders show up here.
          </p>
          <Button asChild className="mt-6">
            <Link href="/shopping/arts">Browse artworks</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container-page py-12">
      <h1 className="mb-8 font-display text-4xl">My orders</h1>
      <div className="space-y-4">
        {orders.map((o) => (
          <Link key={o.id} href={`/orders/${o.id}`} className="block">
            <Card className="transition-colors hover:border-primary/40">
              <CardContent className="grid gap-4 p-5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
                <div className="flex -space-x-3">
                  {o.order_items.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="relative size-14 overflow-hidden rounded-lg border-2 border-card"
                    >
                      <SmartImage
                        src={item.image_url}
                        alt={item.title}
                        kind={item.target_kind === "product" ? "product" : "artwork"}
                        seed={item.title}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="min-w-0">
                  <p className="font-display text-lg">{o.order_number}</p>
                  <p className="line-clamp-1 text-sm text-muted-foreground">
                    {o.order_items.map((i) => i.title).join(", ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Placed {new Date(o.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={STATUS_TONE[o.status] ?? "bg-muted"}>{o.status}</Badge>
                  <p className="font-display text-lg tabular-nums">
                    {formatPrice(o.total, o.currency)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

function formatPrice(amount: number | { toNumber(): number }, currency: string) {
  const n = typeof amount === "number" ? amount : amount.toNumber()
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n)
  } catch {
    return `${currency} ${n.toLocaleString()}`
  }
}
