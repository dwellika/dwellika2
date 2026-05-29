import Link from "next/link"

import { SmartImage } from "@/components/ui/smart-image"
import { MOCK_ARTWORKS, FEATURED_COLLECTIONS } from "@/lib/mock/artworks"

import { Section } from "./Section"

export function FeaturedCollections() {
  const masonry = MOCK_ARTWORKS.slice(0, 12)

  return (
    <Section
      eyebrow="Curated"
      title="Featured collections"
      description="Hand-picked masterworks from our editorial team and guest curators."
      href="/collections"
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_2fr]">
        {/* Curator rail */}
        <div className="space-y-3">
          {FEATURED_COLLECTIONS.map((c) => (
            <Link
              key={c.id}
              href={`/collections/${c.id}`}
              className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card p-3 transition-all hover:border-primary/40 hover:shadow-glow"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                <SmartImage
                  src={c.image}
                  alt={c.title}
                  kind="cover"
                  seed={c.title}
                  fill
                  sizes="80px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="min-w-0">
                <p className="font-display text-lg">{c.title}</p>
                <p className="text-xs text-muted-foreground">
                  {c.curator} · {c.count} works
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Masonry */}
        <div className="columns-1 gap-3 [column-fill:_balance] sm:columns-2 md:columns-3">
          {masonry.map((w) => (
            <figure key={w.id} className="mb-3 break-inside-avoid">
              <Link
                href="/shopping/arts"
                className="group block overflow-hidden rounded-xl bg-card"
              >
                <div
                  className="relative w-full"
                  style={{ aspectRatio: `${w.width} / ${w.height}` }}
                >
                  <SmartImage
                    src={w.image}
                    alt={w.title}
                    kind="artwork"
                    seed={w.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="image-overlay-strong absolute inset-x-0 bottom-0 translate-y-full p-3 text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="text-sm font-medium">{w.title}</p>
                    <p className="text-xs text-white/70">{w.artistName} · {w.medium}</p>
                  </div>
                </div>
              </Link>
            </figure>
          ))}
        </div>
      </div>
    </Section>
  )
}
