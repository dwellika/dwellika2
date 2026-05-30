import Link from "next/link"
import { AlertTriangle, PackageOpen, PlusCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SmartImage } from "@/components/ui/smart-image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { requireRole } from "@/lib/auth/rbac"
import { listSellerProducts } from "@/lib/data/products"

import {
  DeleteProductButton,
  InventoryControl,
  SubmitForReviewButton,
} from "./ProductControls"

export const metadata = { title: "My products — Seller" }

const LOW_STOCK = 10

const STATUS_TONE: Record<string, string> = {
  draft:    "bg-muted text-muted-foreground",
  pending:  "bg-blue-500/20 text-blue-400",
  approved: "bg-emerald-500/20 text-emerald-400",
  rejected: "bg-red-500/20 text-red-400",
  hidden:   "bg-muted text-muted-foreground",
}

const STATUS_LABEL: Record<string, string> = {
  draft:    "Draft",
  pending:  "Under review",
  approved: "Live",
  rejected: "Rejected",
  hidden:   "Hidden",
}

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function SellerProductsPage({ searchParams }: PageProps) {
  const user    = await requireRole("seller", "admin", "super_admin", "artist")
  const { tab = "all" } = await searchParams
  const products = await listSellerProducts(user.id)

  const counts = {
    all:      products.length,
    approved: products.filter((p) => p.status === "approved").length,
    pending:  products.filter((p) => p.status === "pending").length,
    draft:    products.filter((p) => p.status === "draft").length,
    rejected: products.filter((p) => p.status === "rejected").length,
    lowStock: products.filter((p) => p.inventory > 0 && p.inventory < LOW_STOCK).length,
  }

  const filtered =
    tab === "all"      ? products
    : tab === "low"    ? products.filter((p) => p.inventory > 0 && p.inventory < LOW_STOCK)
    : products.filter((p) => p.status === tab)

  return (
    <div className="container-page pb-16 pt-16 sm:pt-20">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Seller studio</p>
          <h1 className="font-display text-4xl">My products</h1>
        </div>
        <Button asChild>
          <Link href="/seller/products/new">
            <PlusCircle className="size-4" /> Add product
          </Link>
        </Button>
      </div>

      {/* Low-stock alert banner */}
      {counts.lowStock > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          <AlertTriangle className="size-5 shrink-0" />
          <span>
            <strong>{counts.lowStock}</strong> product{counts.lowStock > 1 ? "s are" : " is"} running low
            (less than {LOW_STOCK} in stock). Update inventory to avoid missing orders.
          </span>
        </div>
      )}

      <Tabs defaultValue={tab}>
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="all" asChild>
            <Link href="/seller/products?tab=all">All ({counts.all})</Link>
          </TabsTrigger>
          <TabsTrigger value="approved" asChild>
            <Link href="/seller/products?tab=approved">Live ({counts.approved})</Link>
          </TabsTrigger>
          <TabsTrigger value="pending" asChild>
            <Link href="/seller/products?tab=pending">
              Under review
              {counts.pending > 0 && (
                <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                  {counts.pending}
                </span>
              )}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="draft" asChild>
            <Link href="/seller/products?tab=draft">Drafts ({counts.draft})</Link>
          </TabsTrigger>
          <TabsTrigger value="rejected" asChild>
            <Link href="/seller/products?tab=rejected">
              Rejected
              {counts.rejected > 0 && (
                <span className="ml-1 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
                  {counts.rejected}
                </span>
              )}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="low" asChild>
            <Link href="/seller/products?tab=low">
              Low stock
              {counts.lowStock > 0 && (
                <span className="ml-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {counts.lowStock}
                </span>
              )}
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          {filtered.length === 0 ? (
            <EmptyState tab={tab} />
          ) : (
            <Card>
              <CardContent className="divide-y divide-border p-0">
                {filtered.map((p) => {
                  const media   = p.product_media?.[0]
                  const isLow   = p.inventory > 0 && p.inventory < LOW_STOCK
                  const basePrice = Number(p.price)
                  const discPct   = p.discount_pct ?? 0
                  const effPrice  = discPct > 0 ? basePrice * (1 - discPct / 100) : basePrice
                  const canSubmit = p.status === "draft" || p.status === "rejected"
                  const canDelete = p.status === "draft" || p.status === "rejected"

                  return (
                    <div
                      key={p.id}
                      className="grid items-center gap-3 p-4 md:grid-cols-[56px_minmax(0,1fr)_120px_160px_180px_80px]"
                    >
                      {/* Thumbnail */}
                      <div className="relative size-12 overflow-hidden rounded-lg border border-border">
                        <SmartImage
                          src={media?.url ?? null}
                          alt={p.title}
                          kind="product"
                          seed={p.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>

                      {/* Title + tags */}
                      <div className="min-w-0">
                        <p className="line-clamp-1 font-medium">{p.title}</p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {p.category.replace("_", " ")}
                          {p.sku ? ` · SKU: ${p.sku}` : ""}
                        </p>
                      </div>

                      {/* Status */}
                      <Badge className={`capitalize text-xs ${STATUS_TONE[p.status] ?? ""}`}>
                        {STATUS_LABEL[p.status] ?? p.status}
                      </Badge>

                      {/* Price */}
                      <div>
                        <p className="text-sm font-medium tabular-nums">
                          ₹{effPrice.toLocaleString()}
                        </p>
                        {discPct > 0 && (
                          <p className="text-xs text-muted-foreground line-through">
                            ₹{basePrice.toLocaleString()} (-{discPct}%)
                          </p>
                        )}
                      </div>

                      {/* Inventory */}
                      <div className="flex items-center gap-2">
                        <InventoryControl productId={p.id} current={p.inventory} />
                        {p.inventory === 0 ? (
                          <span className="text-xs text-destructive font-medium">Out</span>
                        ) : isLow ? (
                          <span className="flex items-center gap-1 text-xs text-amber-400 font-medium">
                            <AlertTriangle className="size-3" /> Low
                          </span>
                        ) : null}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 justify-end">
                        {canSubmit && <SubmitForReviewButton productId={p.id} />}
                        {canDelete && <DeleteProductButton productId={p.id} />}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmptyState({ tab }: { tab: string }) {
  const msg: Record<string, string> = {
    all:      "No products yet.",
    approved: "No live products. Submit a draft to get started.",
    pending:  "Nothing under review right now.",
    draft:    "No drafts. Create a new product to begin.",
    rejected: "No rejected products.",
    low:      "No products with low stock.",
  }
  return (
    <Card>
      <CardContent className="flex flex-col items-center py-16 text-center">
        <PackageOpen className="size-10 text-muted-foreground" />
        <p className="mt-3 font-display text-xl">{msg[tab] ?? "Nothing here."}</p>
        {tab === "all" && (
          <Button asChild className="mt-4">
            <Link href="/seller/products/new">
              <PlusCircle className="size-4" /> Add your first product
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
