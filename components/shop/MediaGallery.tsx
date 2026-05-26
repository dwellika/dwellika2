"use client"

import { useState } from "react"
import { motion } from "framer-motion"

import { SmartImage } from "@/components/ui/smart-image"
import { cn } from "@/lib/utils"

interface MediaItem {
  url: string
  kind: "image" | "video"
  thumbnail_url?: string | null
  width?: number | null
  height?: number | null
}

interface MediaGalleryProps {
  media: MediaItem[]
  alt: string
}

export function MediaGallery({ media, alt }: MediaGalleryProps) {
  const items = media.length ? media : [{ url: "", kind: "image" as const }]
  const [active, setActive] = useState(0)
  const current = items[active] ?? items[0]

  return (
    <div className="grid gap-3 md:grid-cols-[88px_minmax(0,1fr)]">
      {/* Thumbnails */}
      <div className="order-2 flex gap-2 overflow-x-auto md:order-1 md:flex-col md:overflow-y-auto">
        {items.map((m, i) => (
          <button
            type="button"
            key={`${m.url}-${i}`}
            onClick={() => setActive(i)}
            className={cn(
              "relative size-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
              active === i ? "border-primary" : "border-transparent hover:border-border",
            )}
            aria-label={`Show media ${i + 1}`}
          >
            {m.kind === "video" ? (
              <span className="absolute inset-0 grid place-items-center text-[10px] uppercase tracking-widest text-muted-foreground">
                video
              </span>
            ) : null}
            <SmartImage
              src={m.thumbnail_url || m.url}
              alt={`${alt} thumbnail ${i + 1}`}
              kind="artwork"
              seed={`${alt}-${i}`}
              fill
              sizes="80px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main viewer */}
      <motion.div
        key={current?.url}
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="order-1 md:order-2"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-card">
          {current?.kind === "video" ? (
            <video
              src={current.url}
              controls
              className="size-full object-contain"
              poster={current.thumbnail_url || undefined}
            />
          ) : (
            <SmartImage
              src={current?.url}
              alt={alt}
              kind="artwork"
              seed={alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          )}
        </div>
      </motion.div>
    </div>
  )
}
