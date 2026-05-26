import Link from "next/link"
import { TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { SmartImage } from "@/components/ui/smart-image"
import { createClient } from "@/lib/supabase/server"
import { MOCK_SALES } from "@/lib/mock/home"

export const metadata = {
  title: "Recently sold",
  description: "Fresh out of the studios — works that found their forever homes.",
}

export const revalidate = 120

interface SoldRow {
  id: string
  title: string
  image_url: string | null
  subtotal: number
  unit_price: number
  quantity: number
  order: { currency: string; created_at: string; status: string } | null
}

export default async function SoldPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("order_items")
    .select(
      `id, title, image_url, subtotal, unit_price, quantity,
       order:orders!order_items_order_id_fkey ( currency, created_at, status )`,
    )
    .eq("target_kind", "artwork")
    .order("id", { ascending: false })
    .limit(60)

  const rows = (data ?? []) as unknown as SoldRow[]
  const filtered = rows.filter(
    (r) => r.order && ["confirmed", "shipped", "delivered"].includes(r.order.status),
  )

  return (
    <div className="container-page py-12">
      <header className="mb-8">
        <p className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.25em] text-primary">
          <TrendingUp className="size-3" /> Social proof
        </p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Recently sold</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Fresh out of the studios — works that found their forever homes this
          week.
        </p>
      </header>

      {filtered.length === 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {MOCK_SALES.map((s) => (
              <Card key={s.id} className="overflow-hidden">
                <div className="relative h-48 w-full overflow-hidden">
                  <SmartImage
                    src={s.image}
                    alt={s.title}
                    kind="artwork"
                    seed={s.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />
                  <Badge variant="default" className="absolute left-3 top-3 gap-1 backdrop-blur">
                    <TrendingUp className="size-3" /> Sold
                  </Badge>
                </div>
                <CardContent className="space-y-1 p-4">
                  <p className="line-clamp-1 font-display text-base">{s.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.artist} → {s.buyer}
                  </p>
                  <p className="pt-1 font-display text-lg">₹{s.price.toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-muted-foreground">
            Showing curated examples — no confirmed sales in your database yet.{" "}
            <Link href="/shopping/arts" className="underline">Buy the first one</Link>
          </p>
        </>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {filtered.map((s) => (
            <Card key={s.id} className="overflow-hidden">
              <div className="relative h-48 w-full overflow-hidden">
                <SmartImage
                  src={s.image_url}
                  alt={s.title}
                  kind="artwork"
                  seed={s.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
                <Badge variant="default" className="absolute left-3 top-3 gap-1 backdrop-blur">
                  <TrendingUp className="size-3" /> Sold
                </Badge>
              </div>
              <CardContent className="space-y-1 p-4">
                <p className="line-clamp-1 font-display text-base">{s.title}</p>
                <p className="text-xs text-muted-foreground">
                  {s.order ? new Date(s.order.created_at).toLocaleDateString() : ""}
                </p>
                <p className="pt-1 font-display text-lg tabular-nums">
                  {s.order?.currency ?? "INR"}{" "}
                  {Number(s.subtotal ?? s.unit_price * s.quantity).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
