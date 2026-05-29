import { notFound } from "next/navigation"
import Link from "next/link"
import {
  CheckCircle2,
  CircleDot,
  Package,
  PackageCheck,
  Truck,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SmartImage } from "@/components/ui/smart-image"
import { requireAuth } from "@/lib/auth/rbac"
import { getOrderById } from "@/lib/data/orders"

import { OrderActions } from "./OrderActions"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ paid?: string }>
}

const STATUS_FLOW = ["pending", "confirmed", "processing", "shipped", "delivered"] as const

const STATUS_ICON: Record<string, React.ElementType> = {
  pending: CircleDot,
  confirmed: CheckCircle2,
  processing: Package,
  shipped: Truck,
  delivered: PackageCheck,
  returned: Package,
  cancelled: Package,
}

export const metadata = { title: "Order" }

export default async function OrderDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { paid } = await searchParams
  const user = await requireAuth()
  const order = await getOrderById(id, user.id)
  if (!order) notFound()

  const currentIndex = STATUS_FLOW.indexOf(order.status as typeof STATUS_FLOW[number])

  const shipping = order.shipping_address as {
    full_name: string
    line1: string
    line2?: string | null
    city: string
    state: string
    postal_code: string
    country: string
    phone?: string | null
  } | null

  return (
    <div className="container-page py-12">
      {paid === "1" ? (
        <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          Payment received. We&apos;re preparing your order — you&apos;ll get
          updates here and via notifications.
        </div>
      ) : null}

      <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Order</p>
          <h1 className="font-display text-4xl">{order.order_number}</h1>
          <p className="text-xs text-muted-foreground">
            Placed {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="capitalize">
            {order.status}
          </Badge>
          <OrderActions orderId={order.id} status={order.status} />
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {/* Tracking timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-4 border-l-2 border-border pl-6">
                {STATUS_FLOW.map((status, i) => {
                  const Icon = STATUS_ICON[status] ?? CircleDot
                  const reached = i <= currentIndex
                  return (
                    <li key={status} className="relative">
                      <span
                        className={`absolute -left-[33px] grid size-6 place-items-center rounded-full border-2 ${
                          reached
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-muted-foreground"
                        }`}
                      >
                        <Icon className="size-3" />
                      </span>
                      <p
                        className={
                          reached
                            ? "font-medium capitalize"
                            : "text-muted-foreground capitalize"
                        }
                      >
                        {status}
                      </p>
                      {order.order_tracking_events
                        ?.filter((e) => e.status === status)
                        .map((e) => (
                          <p key={e.id} className="text-xs text-muted-foreground">
                            {new Date(e.occurred_at).toLocaleString()}
                            {e.note ? ` — ${e.note}` : ""}
                            {e.tracking_number ? ` · ${e.carrier} ${e.tracking_number}` : ""}
                          </p>
                        ))}
                    </li>
                  )
                })}
              </ol>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md">
                    <SmartImage
                      src={item.image_url}
                      alt={item.title}
                      kind={item.target_kind === "product" ? "product" : "artwork"}
                      seed={item.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-medium">{item.title}</p>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      {item.target_kind}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display tabular-nums">
                      {formatPrice(Number(item.subtotal ?? 0) || Number(item.unit_price) * item.quantity, order.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">qty {item.quantity}</p>
                    {item.target_kind === "artwork" && order.status === "delivered" ? (
                      <Link
                        href={`/artworks/?review=${item.target_id}&order=${order.id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        Leave review
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Subtotal" value={formatPrice(order.subtotal, order.currency)} />
              <Row label="Shipping" value={formatPrice(order.shipping, order.currency)} />
              <Row label="Tax" value={formatPrice(order.tax, order.currency)} />
              {Number(order.discount) > 0 ? (
                <Row label="Discount" value={`- ${formatPrice(order.discount, order.currency)}`} />
              ) : null}
              <Separator />
              <Row label="Total" value={formatPrice(order.total, order.currency)} bold />
              {order.paid_at ? (
                <p className="pt-2 text-xs text-muted-foreground">
                  Paid {new Date(order.paid_at).toLocaleString()} via {order.payment_provider}
                </p>
              ) : null}
            </CardContent>
          </Card>

          {shipping ? (
            <Card>
              <CardHeader>
                <CardTitle>Shipping to</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="font-medium">{shipping.full_name}</p>
                <p className="text-muted-foreground">
                  {shipping.line1}
                  {shipping.line2 ? `, ${shipping.line2}` : ""}
                  <br />
                  {shipping.city}, {shipping.state} {shipping.postal_code}
                  <br />
                  {shipping.country}
                </p>
                {shipping.phone ? <p className="mt-1 text-muted-foreground">{shipping.phone}</p> : null}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-display text-lg" : ""}`}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span className="tabular-nums">{value}</span>
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
