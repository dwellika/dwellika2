"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingBag, Star } from "lucide-react"
import { toast } from "sonner"

import { LikeButton, SaveButton } from "@/components/social/LikeSaveButtons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SmartImage } from "@/components/ui/smart-image"
import { useCart } from "@/lib/data/cart"
import type { ProductWithMedia } from "@/lib/data/types"
import { cn } from "@/lib/utils"

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

  return (
    <motion.article
      whileHover={{ y: -4 }}
      className={cn("group overflow-hidden rounded-2xl border border-border bg-card", className)}
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
          {product.inventory === 0 ? (
            <Badge variant="destructive" className="absolute left-3 top-3 backdrop-blur">
              Sold out
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
            <p className="shrink-0 font-display text-base">
              {formatPrice(product.price, product.currency)}
            </p>
          </div>

          {product.rating_avg ? (
            <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              {product.rating_avg.toFixed(1)}
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
              disabled={product.inventory === 0}
              onClick={(e) => {
                e.preventDefault()
                cart.add({
                  kind: "product",
                  id: product.id,
                  slug: product.slug,
                  title: product.title,
                  image: image ?? "/placeholder.svg",
                  unitPrice: product.price,
                  currency: product.currency,
                  sellerId: product.seller_id,
                })
                toast.success(`Added to cart: ${product.title}`)
              }}
            >
              <ShoppingBag className="size-3.5" /> Add
            </Button>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

function formatPrice(price: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(price)
  } catch {
    return `${currency} ${price.toLocaleString()}`
  }
}
