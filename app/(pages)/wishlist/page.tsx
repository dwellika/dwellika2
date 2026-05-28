import Link from "next/link"
import { Bookmark } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SmartImage } from "@/components/ui/smart-image"
import { requireAuth } from "@/lib/auth/rbac"
import { prisma } from "@/lib/prisma"

export const metadata = { title: "Saved" }

export default async function WishlistPage() {
  const user = await requireAuth()

  const saves = await prisma.save.findMany({
    where: { user_id: user.id },
    select: { id: true, target_kind: true, target_id: true, created_at: true },
    orderBy: { created_at: "desc" },
  })

  const artworkIds = saves.filter((r) => r.target_kind === "artwork").map((r) => r.target_id)
  const productIds = saves.filter((r) => r.target_kind === "product").map((r) => r.target_id)

  const [artworks, products] = await Promise.all([
    artworkIds.length
      ? prisma.artwork.findMany({
          where: { id: { in: artworkIds } },
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            currency: true,
            for_sale: true,
            artwork_media: { select: { url: true, is_primary: true } },
            artist: { select: { username: true, full_name: true } },
          },
        })
      : [],
    productIds.length
      ? prisma.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            currency: true,
            product_media: { select: { url: true, is_primary: true } },
            seller: { select: { username: true, full_name: true } },
          },
        })
      : [],
  ])

  if (saves.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <Bookmark className="mx-auto size-12 text-muted-foreground" />
        <h1 className="mt-4 font-display text-3xl">No saves yet</h1>
        <p className="mt-2 text-muted-foreground">
          Tap the bookmark icon on any artwork or product to keep track of pieces you love.
        </p>
        <Button asChild className="mt-6">
          <Link href="/shopping/arts">Browse artworks</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container-page py-12">
      <h1 className="mb-8 font-display text-4xl">Saved</h1>

      {artworks.length > 0 ? (
        <section className="mb-12">
          <h2 className="mb-4 font-display text-xl">Artworks</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {artworks.map((a) => {
              const img = a.artwork_media.find((m) => m.is_primary)?.url ?? a.artwork_media[0]?.url
              const href = a.artist?.username
                ? `/artworks/${a.artist.username}/${a.slug}`
                : `/artworks/${a.id}`
              return (
                <Link key={a.id} href={href}>
                  <Card className="group overflow-hidden">
                    <div className="relative aspect-[4/5] w-full overflow-hidden">
                      <SmartImage
                        src={img}
                        alt={a.title}
                        kind="artwork"
                        seed={a.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-4">
                      <p className="line-clamp-1 font-display text-base">{a.title}</p>
                      {a.for_sale && a.price ? (
                        <p className="mt-1 font-display text-sm tabular-nums">
                          ₹{Number(a.price).toLocaleString()}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">Not for sale</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}

      {products.length > 0 ? (
        <section>
          <h2 className="mb-4 font-display text-xl">Products</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => {
              const img = p.product_media.find((m) => m.is_primary)?.url ?? p.product_media[0]?.url
              const href = p.seller?.username
                ? `/products/${p.seller.username}/${p.slug}`
                : `/products/${p.id}`
              return (
                <Link key={p.id} href={href}>
                  <Card className="group overflow-hidden">
                    <div className="relative aspect-square w-full overflow-hidden">
                      <SmartImage
                        src={img}
                        alt={p.title}
                        kind="product"
                        seed={p.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-4">
                      <p className="line-clamp-1 font-display text-base">{p.title}</p>
                      <p className="mt-1 font-display text-sm tabular-nums">
                        ₹{Number(p.price).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}
