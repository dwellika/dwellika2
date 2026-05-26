"use client"

import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { ArtistTiltCard } from "./ArtistTiltCard"
import { Section } from "./Section"
import { Button } from "@/components/ui/button"
import { MOCK_ARTISTS, type MockArtist } from "@/lib/mock/artists"

export function TrendingArtists({ artists }: { artists?: MockArtist[] } = {}) {
  const list = artists && artists.length > 0 ? artists : MOCK_ARTISTS
  const [emblaRef, embla] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  })
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const update = useCallback(() => {
    if (!embla) return
    setCanPrev(embla.canScrollPrev())
    setCanNext(embla.canScrollNext())
  }, [embla])

  useEffect(() => {
    if (!embla) return
    update()
    embla.on("select", update)
    embla.on("reInit", update)
  }, [embla, update])

  return (
    <Section
      eyebrow="The collective"
      title="Trending artists"
      description="A rotating cast of artists collectors are watching this week."
      href="/artists"
    >
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-5">
            {list.map((a) => (
              <ArtistTiltCard key={a.id} artist={a} />
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => embla?.scrollPrev()}
            disabled={!canPrev}
            aria-label="Previous"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => embla?.scrollNext()}
            disabled={!canNext}
            aria-label="Next"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </Section>
  )
}
