"use client"

import Link from "next/link"
import { ShoppingBag, Star } from "lucide-react"
import { toast } from "sonner"

import { LikeButton, SaveButton } from "@/components/social/LikeSaveButtons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SmartImage } from "@/components/ui/smart-image"
import { useCart } from "@/lib/data/cart"
import type { ProductWithMedia } from "@/lib/data/types"
import { cn } from "@/lib/utils"

const LOW_STOCK_THRESHOLD = 10

interface ProductCardProps {
  product: ProductWithMedia
  seller?: { id: string; username: string | null; full_name: string | null } | null
  isAuthed: boolean
  liked?: boolean
  saved?: boolean
  className?: string
}

export function ProductCard({
  product,
  seller,
  isAuthed,
  liked = false,
  saved = false,
  className,
}: ProductCardProps) {
  const cart = useCart()
  const media = product.product_media?.find((m) => m.is_primary) ?? product.product_media?.[0]
  const image = media?.url ?? null
  const sellerName = seller?.full_name ?? seller?.username ?? ""

  const href = seller?.username
    ? `/products/${seller.username}/${product.slug}`
    : `/products/${product.id}`

  // Discount calculation
  const discountPct = product.discount_pct ?? 0
  const basePrice   = typeof product.price === "number" ? product.price : Number(product.price)
  const effectivePrice = discountPct > 0 ? basePrice * (1 - discountPct / 100) : basePrice
  const isLowStock = product.inventory > 0 && product.inventory < LOW_STOCK_THRESHOLD
  const isSoldOut  = product.inventory === 0

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-2xl border border-border bg-card transition-transform duration-300 ease-out hover:-translate-y-1",
        className,
      )}
    >
      <Link href={href} className="block">
        <div className="relative aspect-square w-full overflow-hidden">
          <SmartImage
            src={image}
            alt={product.title}
            kind="product"
            seed={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Stock badges */}
          {isSoldOut ? (
            <Badge variant="destructive" className="absolute left-3 top-3 backdrop-blur">
              Sold out
            </Badge>
          ) : isLowStock ? (
            <Badge className="absolute left-3 top-3 bg-amber-500/90 text-white backdrop-blur">
              Only {product.inventory} left
            </Badge>
          ) : null}

          {/* Discount badge */}
          {discountPct > 0 && !isSoldOut ? (
            <Badge className="absolute right-3 top-3 bg-emerald-600 text-white">
              -{discountPct}%
            </Badge>
          ) : null}

          <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
            <SaveButton
              targetKind="product"
              targetId={product.id}
              initial={saved}
              isAuthed={isAuthed}
              className="rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70"
            />
          </div>
        </div>

        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="line-clamp-1 font-display text-base">{product.title}</p>
              {sellerName ? (
                <p className="line-clamp-1 text-xs text-muted-foreground">by {sellerName}</p>
              ) : null}
            </div>
            <div className="shrink-0 text-right">
              {discountPct > 0 ? (
                <>
                  <p className="font-display text-base">{formatPrice(effectivePrice, product.currency)}</p>
                  <p className="text-xs text-muted-foreground line-through">{formatPrice(basePrice, product.currency)}</p>
                </>
              ) : (
                <p className="font-display text-base">{formatPrice(basePrice, product.currency)}</p>
              )}
            </div>
          </div>

          {product.rating_avg ? (
            <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              {Number(product.rating_avg).toFixed(1)}
              <span className="text-muted-foreground/70">({product.rating_count})</span>
            </p>
          ) : null}

          <div className="flex items-center justify-between border-t border-border pt-2">
            <LikeButton
              targetKind="product"
              targetId={product.id}
              initial={liked}
              isAuthed={isAuthed}
              className="-ml-2"
            />
            <Button
              size="sm"
              disabled={isSoldOut}
              onClick={(e) => {
                e.preventDefault()
                cart.add({
                  kind:      "product",
                  id:        product.id,
                  slug:      product.slug,
                  title:     product.title,
                  image:     image ?? "/placeholder.svg",
                  unitPrice: effectivePrice,
                  currency:  product.currency,
                  sellerId:  product.seller_id,
                })
                toast.success(`Added to cart: ${product.title}`)
              }}
            >
              <ShoppingBag className="size-3.5" /> Add
            </Button>
          </div>
        </div>
      </Link>
    </article>
  )
}

function formatPrice(price: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(price)
  } catch {
    return `${currency} ${price.toLocaleString()}`
  }
}
