"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import { motion } from "framer-motion"
import { ShoppingBag, Eye } from "lucide-react"
import { toast } from "sonner"

import { LikeButton, SaveButton } from "@/components/social/LikeSaveButtons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SmartImage } from "@/components/ui/smart-image"
import { useCart } from "@/lib/data/cart"
import type { ArtworkWithMedia } from "@/lib/data/types"
import { cn } from "@/lib/utils"

interface ArtworkCardProps {
  artwork: ArtworkWithMedia
  artist: { id: string; username: string | null; full_name: string | null; avatar_url: string | null }
  isAuthed: boolean
  liked?: boolean
  saved?: boolean
  className?: string
}

export function ArtworkCard({
  artwork,
  artist,
  isAuthed,
  liked = false,
  saved = false,
  className,
}: ArtworkCardProps) {
  const cart = useCart()
  const ref = useRef<HTMLAnchorElement>(null)
  const [hovered, setHovered] = useState(false)

  const media = artwork.artwork_media?.find((m) => m.is_primary) ?? artwork.artwork_media?.[0]
  const image = media?.url ?? null
  const href = artist.username
    ? `/artworks/${artist.username}/${artwork.slug}`
    : `/artworks/${artwork.id}`

  const onAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!artwork.for_sale || artwork.price == null) return
    cart.add({
      kind: "artwork",
      id: artwork.id,
      slug: artwork.slug,
      title: artwork.title,
      image: image ?? "/placeholder.svg",
      unitPrice: artwork.price,
      currency: artwork.currency,
      sellerId: artwork.artist_id,
      artistUsername: artist.username,
    })
    toast.success(`Added to cart: ${artwork.title}`)
  }

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn("group relative overflow-hidden rounded-2xl border border-border bg-card", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link ref={ref} href={href} className="block">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <SmartImage
            src={image}
            alt={artwork.title}
            kind="artwork"
            seed={artwork.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="image-overlay absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {!artwork.for_sale ? (
            <Badge
              variant="outline"
              className="absolute left-3 top-3 border-white/40 bg-black/60 text-white backdrop-blur"
            >
              Not for sale
            </Badge>
          ) : null}

          {/* Hover quick actions */}
          <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <SaveButton
              targetKind="artwork"
              targetId={artwork.id}
              initial={saved}
              isAuthed={isAuthed}
              className="rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70"
            />
          </div>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="absolute bottom-3 right-3 gap-1 opacity-0 transition-all duration-300 group-hover:opacity-100"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              window.location.href = href
            }}
          >
            <Eye className="size-3.5" /> Quick view
          </Button>
        </div>

        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="line-clamp-1 font-display text-base">{artwork.title}</p>
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {artwork.medium}
                {artist.full_name ? ` · ${artist.full_name}` : ""}
              </p>
            </div>
            {artwork.for_sale && artwork.price != null ? (
              <p className="shrink-0 font-display text-base">
                {formatPrice(artwork.price, artwork.currency)}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between border-t border-border pt-2">
            <LikeButton
              targetKind="artwork"
              targetId={artwork.id}
              initial={liked}
              count={artwork.like_count}
              isAuthed={isAuthed}
              className="-ml-2"
            />
            {artwork.for_sale && artwork.price != null ? (
              <Button size="sm" onClick={onAddToCart}>
                <ShoppingBag className="size-3.5" /> Add
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">View only</span>
            )}
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
