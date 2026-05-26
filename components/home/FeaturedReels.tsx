"use client"

import Link from "next/link"
import { Play } from "lucide-react"

import { SmartImage } from "@/components/ui/smart-image"

import { Section } from "./Section"
import { MOCK_REELS } from "@/lib/mock/home"

export function FeaturedReels() {
  // Duplicate the list to make the marquee seamless.
  const reels = [...MOCK_REELS, ...MOCK_REELS]

  return (
    <Section
      eyebrow="Reels"
      title="Watch artists make it"
      description="Vertical, snackable, infinite. The studio always feels close."
      href="/reels"
    >
      <div className="relative -mx-4 overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-background to-transparent" />

        <div className="flex w-max gap-4 px-4" style={{ animation: "var(--animate-marquee)" }}>
          {reels.map((r, i) => (
            <Link
              key={`${r.id}-${i}`}
              href={`/reels#${r.id}`}
              className="group relative h-[420px] w-[240px] shrink-0 overflow-hidden rounded-2xl border border-border bg-card"
            >
              <SmartImage
                src={r.thumbnail}
                alt={r.title}
                kind="reel"
                seed={r.title}
                fill
                sizes="240px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="image-overlay-strong absolute inset-0" />

              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="grid size-14 place-items-center rounded-full bg-white/20 backdrop-blur">
                  <Play className="size-6 text-white" />
                </div>
              </div>

              <div className="absolute inset-x-3 bottom-3 text-white">
                <p className="line-clamp-2 font-display text-sm leading-snug">{r.title}</p>
                <p className="mt-1 text-[11px] text-white/70">
                  {r.creator} · {(r.views / 1000).toFixed(0)}k views
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Section>
  )
}
