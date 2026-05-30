import Link from "next/link"
import { AlertTriangle, PackagePlus, PlusCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SmartImage } from "@/components/ui/smart-image"
import { requireRole } from "@/lib/auth/rbac"
import { listSellerOrders } from "@/lib/data/orders"
import { listSellerProducts } from "@/lib/data/products"

export const metadata = { title: "Seller dashboard" }

const LOW_STOCK = 10

export default async function SellerDashboardPage() {
  const user = await requireRole("seller", "admin", "super_admin", "artist")

  const [orderItems, products] = await Promise.all([
    listSellerOrders(user.id),
    listSellerProducts(user.id),
  ])

  const revenue    = orderItems.reduce((s, oi) => s + Number(oi.subtotal ?? 0), 0)
  const orderCount = new Set(orderItems.map((oi) => oi.order_id)).size

  const activeProducts  = products.filter((p) => p.status === "approved").length
  const pendingProducts = products.filter((p) => p.status === "pending").length
  const lowStockCount   = products.filter((p) => p.inventory > 0 && p.inventory < LOW_STOCK).length

  return (
    <div className="container-page pb-16 pt-16 sm:pt-20">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl">Seller dashboard</h1>
        <Button asChild>
          <Link href="/seller/products/new">
            <PlusCircle className="size-4" /> Add Item / Art Supply
          </Link>
        </Button>
      </div>

      {/* Low-stock alert */}
      {lowStockCount > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          <AlertTriangle className="size-5 shrink-0" />
          <span>
            <strong>{lowStockCount}</strong> product{lowStockCount > 1 ? "s are" : " is"} low on stock.{" "}
            <Link href="/seller/products?tab=low" className="underline underline-offset-2">
              Update inventory →
            </Link>
          </span>
        </div>
      )}

      {/* Sales stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Stat label="Orders"     value={orderCount.toString()} />
        <Stat label="Revenue"    value={`₹${revenue.toLocaleString()}`} />
        <Stat label="Items sold" value={String(orderItems.reduce((s, oi) => s + oi.quantity, 0))} />
      </div>

      {/* Product overview */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Link href="/seller/products?tab=approved" className="group">
          <Card className="transition-all group-hover:border-primary/40">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Live products</p>
              <p className="mt-1 font-display text-3xl tabular-nums text-emerald-400">{activeProducts}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/seller/products?tab=pending" className="group">
          <Card className="transition-all group-hover:border-primary/40">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Under review</p>
              <p className="mt-1 font-display text-3xl tabular-nums text-blue-400">{pendingProducts}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/seller/products?tab=low" className="group">
          <Card className="transition-all group-hover:border-primary/40">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Low stock</p>
                {lowStockCount > 0 && <AlertTriangle className="size-4 text-amber-400" />}
              </div>
              <p className={`mt-1 font-display text-3xl tabular-nums ${lowStockCount > 0 ? "text-amber-400" : ""}`}>
                {lowStockCount}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick actions */}
      <div className="mb-8 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/seller/products">
            <PackagePlus className="size-4" /> Manage products
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/seller/products/new">
            <PlusCircle className="size-4" /> Add Item / Art Supply
          </Link>
        </Button>
      </div>

      {/* Recent orders */}
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
