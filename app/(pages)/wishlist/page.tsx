import Link from "next/link"
import { Bookmark } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SmartImage } from "@/components/ui/smart-image"
import { requireAuth } from "@/lib/auth/rbac"
import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "Saved" }

interface SaveRow {
  id: string
  target_kind: "artwork" | "reel" | "post" | "product" | "comment"
  target_id: string
  created_at: string
}

export default async function WishlistPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: saves } = await supabase
    .from("saves")
    .select("id, target_kind, target_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const rows = (saves ?? []) as SaveRow[]
  const artworkIds = rows.filter((r) => r.target_kind === "artwork").map((r) => r.target_id)
  const productIds = rows.filter((r) => r.target_kind === "product").map((r) => r.target_id)

  const [artworksRes, productsRes] = await Promise.all([
    artworkIds.length
      ? supabase
          .from("artworks")
          .select(
            `id, title, slug, price, currency, for_sale,
             artwork_media ( url, is_primary ),
             artist:profiles!artworks_artist_id_fkey ( username, full_name )`,
          )
          .in("id", artworkIds)
      : Promise.resolve({ data: [] }),
    productIds.length
      ? supabase
          .from("products")
          .select(
            `id, title, slug, price, currency,
             product_media ( url, is_primary ),
             seller:profiles!products_seller_id_fkey ( username, full_name )`,
          )
          .in("id", productIds)
      : Promise.resolve({ data: [] }),
  ])

  const artworks =
    (artworksRes.data ?? []) as unknown as Array<{
      id: string
      title: string
      slug: string
      price: number | null
      currency: string
      for_sale: boolean
      artwork_media: Array<{ url: string; is_primary: boolean }>
      artist: { username: string | null; full_name: string | null } | null
    }>
  const products =
    (productsRes.data ?? []) as unknown as Array<{
      id: string
      title: string
      slug: string
      price: number
      currency: string
      product_media: Array<{ url: string; is_primary: boolean }>
      seller: { username: string | null; full_name: string | null } | null
    }>

  if (rows.length === 0) {
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
