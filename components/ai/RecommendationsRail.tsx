"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"

import { SmartImage } from "@/components/ui/smart-image"

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

export function RecommendationsRail() {
  const [items, setItems] = useState<Result[] | null>(null)
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch("/api/ai/recommend")
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return
        if (!j.ok) {
          setEnabled(false)
          return
        }
        setItems(j.results)
      })
      .catch(() => setEnabled(false))
    return () => {
      cancelled = true
    }
  }, [])

  if (!enabled || !items || items.length === 0) return null

  return (
    <section className="container-page py-16">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <p className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.25em] text-primary">
            <Sparkles className="size-3" /> For you
          </p>
          <h2 className="mt-1 font-display text-3xl md:text-4xl">
            Recommended based on what you save
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
