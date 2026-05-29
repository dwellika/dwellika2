"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Sparkles, TrendingUp } from "lucide-react"

import { SmartImage } from "@/components/ui/smart-image"
import { Skeleton } from "@/components/ui/skeleton"

interface Result {
  id: string
  title: string
  slug: string
  artist_id: string
  artist_username: string | null
  primary_url: string | null
  price: number | null
  currency: string
}

type Status = "loading" | "ai" | "trending" | "empty"

export function RecommendationsRail() {
  const [items, setItems] = useState<Result[]>([])
  const [status, setStatus] = useState<Status>("loading")

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch("/api/ai/recommend")
        const j = await res.json()
        if (cancelled) return
        if (j.ok && j.results?.length > 0) {
          setItems(j.results)
          setStatus("ai")
          return
        }
      } catch {
        // fall through to trending
      }

      if (cancelled) return

      // Fallback: fetch trending artworks
      try {
        const res = await fetch("/api/artworks/trending?limit=12")
        const j = await res.json()
        if (cancelled) return
        if (j.ok && j.artworks?.length > 0) {
          setItems(j.artworks)
          setStatus("trending")
          return
        }
      } catch {
        // silent
      }

      if (!cancelled) setStatus("empty")
    }

    load()
    return () => { cancelled = true }
  }, [])

  if (status === "loading") {
    return (
      <section className="container-page py-16">
        <div className="mb-6 space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-9 w-72" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
          ))}
        </div>
      </section>
    )
  }

  if (status === "empty" || items.length === 0) return null

  const isTrending = status === "trending"

  return (
    <section className="container-page py-16">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <p className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.25em] text-primary">
            {isTrending ? (
              <><TrendingUp className="size-3" /> Trending</>
            ) : (
              <><Sparkles className="size-3" /> For you</>
            )}
          </p>
          <h2 className="mt-1 font-display text-3xl md:text-4xl">
            {isTrending
              ? "Trending right now"
              : "Recommended based on what you save"}
          </h2>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        {items.slice(0, 12).map((r) => (
          <Link
            key={r.id}
            href={r.artist_username ? `/artworks/${r.artist_username}/${r.slug}` : "/shopping/arts"}
          >
            <div className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-border bg-card">
              <SmartImage
                src={r.primary_url}
                alt={r.title}
                kind="artwork"
                seed={r.title}
                fill
                sizes="(max-width:768px) 50vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="image-overlay-strong absolute inset-x-0 bottom-0 p-2 text-white">
                <p className="line-clamp-1 text-xs">{r.title}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
