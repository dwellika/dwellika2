import Link from "next/link"
import { Brush, Globe, Sparkles, Users } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "About",
  description: "Dwellika is a museum-grade marketplace and social platform for artists.",
}

const PRINCIPLES = [
  {
    Icon: Brush,
    title: "Craft first",
    body: "Every surface is built so the work stays the hero. No glittering ads on top of the canvas, no compressed thumbnails.",
  },
  {
    Icon: Users,
    title: "Artists, not algorithms",
    body: "Discovery is curated by people who know the medium. Recommendations are signals, not strait jackets.",
  },
  {
    Icon: Globe,
    title: "Global, fair, transparent",
    body: "Sellers and artists keep more of every sale. Reviews are real, disputes get human resolution.",
  },
  {
    Icon: Sparkles,
    title: "Built like a museum",
    body: "Dark, considered, premium. The platform should feel like the gallery you would have visited anyway.",
  },
]

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <p className="text-xs uppercase tracking-[0.25em] text-primary">About</p>
      <h1 className="mt-2 font-display text-5xl md:text-6xl">
        A living museum for artists and collectors.
      </h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Dwellika is a marketplace and social platform for artists, suppliers,
        collectors, hobbyists, and the curators who connect them. We started
        because the world&apos;s best art platforms treat art like content —
        and we wanted one that treats it like art.
      </p>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {PRINCIPLES.map((p) => (
          <Card key={p.title}>
            <CardContent className="space-y-2 p-5">
              <div className="grid size-10 place-items-center rounded-md bg-primary/15 text-primary">
                <p.Icon className="size-5" />
              </div>
              <h2 className="font-display text-xl">{p.title}</h2>
              <p className="text-sm text-muted-foreground">{p.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="mt-16">
        <h2 className="font-display text-3xl">By the numbers</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat value="12k+" label="Artists" />
          <Stat value="380k+" label="Artworks" />
          <Stat value="120+" label="Countries" />
          <Stat value="4.9 / 5" label="Avg review" />
        </div>
      </section>

      <section className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
        <h2 className="font-display text-3xl">Join the museum</h2>
        <p className="mt-2 text-muted-foreground">
          Whether you make, sell, or collect — there is a seat for you here.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/signup">Create an account</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/sellers/join">Sell on Dwellika</Link>
          </Button>
        </div>
      </section>
    </article>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 text-center">
      <p className="font-display text-3xl">{value}</p>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  )
}
