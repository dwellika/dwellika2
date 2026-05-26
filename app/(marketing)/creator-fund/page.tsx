import Link from "next/link"
import { ArrowRight, Calendar, HandCoins, Sparkles, Trophy } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Creator Fund",
  description: "Quarterly grants for the artists shaping Dwellika's communities.",
}

const TIERS = [
  { tier: "Spark", amount: "₹25,000", count: 12, body: "For emerging artists with a portfolio in progress." },
  { tier: "Studio", amount: "₹1,00,000", count: 6, body: "For full-time artists building a body of work." },
  { tier: "Legacy", amount: "₹3,00,000", count: 2, body: "For artists with a multi-year vision the world deserves to see." },
]

export default function CreatorFundPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <p className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.25em] text-primary">
        <Sparkles className="size-3" /> Creator Fund
      </p>
      <h1 className="mt-2 font-display text-5xl md:text-6xl">
        Quarterly grants for the artists shaping Dwellika.
      </h1>
      <p className="mt-6 text-lg text-muted-foreground">
        The Dwellika Creator Fund grants ₹50 lakh every quarter to artists doing
        ambitious work on the platform. No equity. No strings. Just material
        support for the next thing you&apos;re trying to make.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <Button asChild size="lg">
          <Link href="/contact">
            Apply <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <section className="mt-16">
        <h2 className="mb-6 font-display text-3xl">Tiers</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {TIERS.map((t) => (
            <Card key={t.tier}>
              <CardContent className="space-y-2 p-5">
                <div className="grid size-10 place-items-center rounded-md bg-primary/15 text-primary">
                  <Trophy className="size-5" />
                </div>
                <p className="font-display text-xl">{t.tier}</p>
                <p className="font-display text-2xl tabular-nums">{t.amount}</p>
                <Badge variant="outline">{t.count} grants / quarter</Badge>
                <p className="text-sm text-muted-foreground">{t.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-16 space-y-3">
        <h2 className="font-display text-2xl">Eligibility</h2>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>· Must have an active Dwellika profile with at least one published artwork.</li>
          <li>· Open to all mediums and all geographies.</li>
          <li>· Grants are taxable in the artist&apos;s jurisdiction.</li>
        </ul>
      </section>

      <section className="mt-12 rounded-2xl border border-border bg-card p-8">
        <Calendar className="size-5 text-primary" />
        <p className="mt-2 font-display text-xl">Next round</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Applications open the first Monday of every quarter. Decisions within
          4 weeks of closing.
        </p>
        <Button asChild className="mt-4">
          <Link href="/contact">
            <HandCoins className="size-4" /> Apply now
          </Link>
        </Button>
      </section>
    </article>
  )
}
