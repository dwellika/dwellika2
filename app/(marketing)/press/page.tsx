import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Press",
  description: "Press, brand assets, and coverage.",
}

const COVERAGE = [
  { outlet: "The Hindu", date: "Apr 2026", title: "Dwellika opens the digital gallery for emerging Indian artists" },
  { outlet: "Wired", date: "Mar 2026", title: "How a museum-grade marketplace is rethinking AI search" },
  { outlet: "Mint", date: "Feb 2026", title: "Inside the new social economy for art" },
]

export default function PressPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <p className="text-xs uppercase tracking-[0.25em] text-primary">Press</p>
      <h1 className="mt-2 font-display text-5xl md:text-6xl">Press kit & coverage</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        For brand assets, founder bios, or interview requests, reach out at{" "}
        <a className="text-foreground underline" href="mailto:press@dwellika.com">
          press@dwellika.com
        </a>
        .
      </p>

      <section className="mt-12">
        <h2 className="mb-4 font-display text-2xl">Recent coverage</h2>
        <div className="space-y-3">
          {COVERAGE.map((c) => (
            <Card key={c.title}>
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {c.outlet} · {c.date}
                </p>
                <p className="mt-1 font-display text-lg">{c.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-border bg-card p-8">
        <h2 className="font-display text-2xl">Brand assets</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The Dwellika wordmark and logo are available in light and dark
          variants, vector and PNG. Drop us a line and we&apos;ll share the kit.
        </p>
        <Link
          href="/contact"
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          Request the kit →
        </Link>
      </section>
    </article>
  )
}
