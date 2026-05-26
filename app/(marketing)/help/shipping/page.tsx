import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Shipping & returns",
  description: "Delivery windows, tracking, and the Dwellika returns policy.",
}

const REGIONS = [
  { region: "India · Tier 1 cities", ship: "1-2 days", deliver: "3-5 business days" },
  { region: "India · Tier 2/3", ship: "2-3 days", deliver: "5-9 business days" },
  { region: "South & SE Asia", ship: "2-4 days", deliver: "6-12 business days" },
  { region: "Europe & UK", ship: "3-5 days", deliver: "7-14 business days" },
  { region: "North America", ship: "3-5 days", deliver: "7-14 business days" },
  { region: "Rest of world", ship: "4-7 days", deliver: "10-20 business days" },
]

export default function ShippingPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <p className="text-xs uppercase tracking-[0.25em] text-primary">Help</p>
      <h1 className="mt-2 font-display text-4xl md:text-5xl">Shipping & returns</h1>

      <section className="mt-10 space-y-3">
        <h2 className="font-display text-2xl">Delivery windows</h2>
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {REGIONS.map((r) => (
              <div
                key={r.region}
                className="grid items-center gap-2 p-3 text-sm md:grid-cols-3"
              >
                <p className="font-medium">{r.region}</p>
                <p className="text-muted-foreground">Ships in {r.ship}</p>
                <p className="text-muted-foreground">Delivers in {r.deliver}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground">
          Free shipping on orders over ₹2,000 within India. Customs and import
          duties for international orders are the buyer&apos;s responsibility.
        </p>
      </section>

      <section className="mt-10 space-y-2">
        <h2 className="font-display text-2xl">Returns</h2>
        <p className="text-sm text-muted-foreground">
          <strong>Original artworks</strong> are non-returnable unless they arrive
          damaged. Open a dispute with photos within 48 hours of delivery and
          Buyer Protection applies.
        </p>
        <p className="text-sm text-muted-foreground">
          <strong>Prints, supplies, and decor</strong> can be returned within 7
          days of delivery in original condition. Refunds are processed within
          5 business days of receipt.
        </p>
      </section>

      <section className="mt-10 space-y-2">
        <h2 className="font-display text-2xl">Tracking</h2>
        <p className="text-sm text-muted-foreground">
          Live tracking shows up under <Link href="/orders" className="underline text-foreground">My orders</Link> the
          moment your seller hands the package to the carrier.
        </p>
      </section>
    </article>
  )
}
