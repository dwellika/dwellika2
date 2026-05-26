import Link from "next/link"
import {
  ArrowRight,
  Calendar,
  Mic,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Host a workshop",
  description: "Teach what you know, on a platform built for makers. Live sessions, recordings, and certificates.",
}

const PERKS = [
  { Icon: Calendar, title: "Live or recorded", body: "Run live masterclasses or upload pre-recorded series — we handle scheduling and reminders." },
  { Icon: Users, title: "Built-in audience", body: "Promotion across reels, communities, and the Dwellika home page." },
  { Icon: Mic, title: "First-class video", body: "Stream from any tool you like. We auto-publish the recording afterwards." },
  { Icon: Wallet, title: "Keep 85% of revenue", body: "Industry-leading split — no platform fees on free workshops." },
]

export default function HostWorkshopPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <p className="text-xs uppercase tracking-[0.25em] text-primary">For instructors</p>
      <h1 className="mt-2 font-display text-5xl md:text-6xl">
        Teach what you know.
      </h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Host live workshops or build a recorded course on Dwellika. We&apos;ll
        promote it, handle ticketing, and pay you out weekly.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <Button asChild size="lg">
          <Link href="/artist/dashboard">
            Open Studio <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/workshops">See live workshops</Link>
        </Button>
      </div>

      <section className="mt-16 grid gap-4 sm:grid-cols-2">
        {PERKS.map((p) => (
          <Card key={p.title}>
            <CardContent className="space-y-2 p-5">
              <div className="grid size-10 place-items-center rounded-md bg-primary/15 text-primary">
                <p.Icon className="size-5" />
              </div>
              <p className="font-display text-lg">{p.title}</p>
              <p className="text-sm text-muted-foreground">{p.body}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
        <Sparkles className="mx-auto size-5 text-primary" />
        <h2 className="mt-3 font-display text-3xl">Become an instructor</h2>
        <p className="mt-2 text-muted-foreground">
          Apply through your studio dashboard. Approval takes 2-3 days.
        </p>
        <Button asChild className="mt-6">
          <Link href="/artist/dashboard">Apply from Studio →</Link>
        </Button>
      </section>
    </article>
  )
}
