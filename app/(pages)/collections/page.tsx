import Link from "next/link"

import { Card } from "@/components/ui/card"
import { SmartImage } from "@/components/ui/smart-image"
import { FEATURED_COLLECTIONS } from "@/lib/mock/artworks"

export const metadata = {
  title: "Collections",
  description: "Curated collections from Dwellika editors and guest curators.",
}

export const revalidate = 300

export default function CollectionsPage() {
  return (
    <div className="container-page py-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Curated</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Collections</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Hand-picked sets of works around a mood, medium, or moment. Updated
          every week by Dwellika editors and rotating guest curators.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURED_COLLECTIONS.map((c) => (
          <Link key={c.id} href={`/collections/${c.id}`}>
            <Card className="group h-full overflow-hidden transition-all hover:border-primary/40">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <SmartImage
                  src={c.image}
                  alt={c.title}
                  kind="cover"
                  seed={c.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="image-overlay-strong absolute inset-0" />
                <div className="absolute inset-x-3 bottom-3 text-white">
                  <p className="font-display text-xl leading-tight">{c.title}</p>
                  <p className="mt-1 text-xs text-white/70">
                    {c.curator} · {c.count} works
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
