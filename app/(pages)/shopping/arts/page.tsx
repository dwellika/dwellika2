import { Suspense } from "react"

import { ArtworkCard } from "@/components/artworks/ArtworkCard"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { ShopToolbar } from "@/components/shop/ShopToolbar"
import { getCurrentUser } from "@/lib/auth/rbac"
import { listArtworks } from "@/lib/data/artworks"
import { MOCK_ARTWORKS } from "@/lib/mock/artworks"

export const metadata = {
  title: "Original Artworks",
  description: "Paintings, drawings, mixed media — directly from the artist.",
}

export const revalidate = 60

const MEDIUMS = ["Watercolor", "Oil", "Acrylic", "Charcoal", "Digital", "Mixed Media", "Sculpture"]

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most liked" },
  { value: "price_asc", label: "Price: low → high" },
  { value: "price_desc", label: "Price: high → low" },
]

const PAGE_SIZE = 32

interface PageProps {
  searchParams: Promise<{
    q?: string
    medium?: string
    sort?: "newest" | "popular" | "price_asc" | "price_desc"
    minPrice?: string
    maxPrice?: string
    page?: string
  }>
}

export default async function ArtsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { q, medium, sort = "newest", minPrice, maxPrice, page: pageStr } = params
  const page = Math.max(1, Number(pageStr ?? 1) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const viewer = await getCurrentUser()

  const { artworks, count } = await listArtworks({
    q,
    mediums: medium ? [medium] : undefined,
    forSaleOnly: false,
    sort,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    limit: PAGE_SIZE,
    offset,
  })

  const usingMock = artworks.length === 0 && count === 0

  return (
    <div className="container-page pb-12 pt-16 sm:pt-20">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Shop</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Original artworks</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {count > 0
            ? `${count.toLocaleString()} works available right now, straight from the studio.`
            : "Paintings, drawings, mixed media — directly from the artist."}
        </p>
      </header>

      <Suspense>
        <ShopToolbar
          searchPlaceholder="Search artworks…"
          sortOptions={SORTS}
          filters={[{ id: "medium", label: "Medium", options: MEDIUMS }]}
          priceRange={{ min: 0, max: 100000 }}
        />
      </Suspense>

      {usingMock ? (
        <>
          <div className="grid grid-cols-2 gap-3 md:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {MOCK_ARTWORKS.slice(0, 12).map((w) => (
              <a
                key={w.id}
                href="#"
                className="group block overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={w.image} alt={w.title} className="size-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <div className="space-y-1 p-4">
                  <p className="line-clamp-1 font-display text-base">{w.title}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{w.medium} · {w.artistName}</p>
                  {w.forSale && w.price ? (
                    <p className="pt-1 font-display text-base">₹{w.price.toLocaleString()}</p>
                  ) : null}
                </div>
              </a>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-muted-foreground">
            Showing curated examples — no published artworks yet.
          </p>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {artworks.map((a) => (
              <ArtworkCard
                key={a.id}
                artwork={a}
                artist={{
                  id: a.artist_id,
                  username: a.artist?.username ?? null,
                  full_name: a.artist?.full_name ?? null,
                  avatar_url: a.artist?.avatar_url ?? null,
                }}
                isAuthed={Boolean(viewer)}
              />
            ))}
          </div>

          <PaginationControls
            page={page}
            totalCount={count}
            pageSize={PAGE_SIZE}
            searchParams={params as Record<string, string | undefined>}
            basePath="/shopping/arts"
          />
        </>
      )}
    </div>
  )
}
