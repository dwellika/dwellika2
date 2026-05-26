import { notFound } from "next/navigation"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { SmartImage } from "@/components/ui/smart-image"
import { FEATURED_COLLECTIONS, MOCK_ARTWORKS } from "@/lib/mock/artworks"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const c = FEATURED_COLLECTIONS.find((x) => x.id === id)
  return {
    title: c?.title ?? "Collection",
    description: c ? `${c.title} — curated by ${c.curator}.` : undefined,
  }
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const { id } = await params
  const collection = FEATURED_COLLECTIONS.find((c) => c.id === id)
  if (!collection) notFound()

  const works = MOCK_ARTWORKS.slice(0, collection.count)

  return (
    <div className="relative">
      <div className="relative h-64 w-full overflow-hidden md:h-80">
        <SmartImage
          src={collection.image}
          alt={collection.title}
          kind="cover"
          seed={collection.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="container-page -mt-20 pb-16">
        <header className="mb-8">
          <Badge variant="secondary">Curated</Badge>
          <h1 className="mt-2 font-display text-5xl md:text-6xl">{collection.title}</h1>
          <p className="mt-2 text-muted-foreground">
            Curated by <span className="text-foreground">{collection.curator}</span> · {collection.count} works
          </p>
        </header>

        <div className="columns-2 gap-4 [column-fill:_balance] sm:columns-3 lg:columns-4">
          {works.map((w) => (
            <Link key={w.id} href="/shopping/arts" className="mb-4 block break-inside-avoid">
              <Card className="group overflow-hidden">
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
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <CardContent className="p-3">
                  <p className="line-clamp-1 text-sm font-medium">{w.title}</p>
                  <p className="text-xs text-muted-foreground">{w.medium} · {w.artistName}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
