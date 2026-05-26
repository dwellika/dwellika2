import Link from "next/link"
import { ArrowRight, Camera, Film, Sparkles, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Reels Studio",
  description: "Upload, edit, and publish short-form vertical videos from the studio.",
}

const TIPS = [
  { Icon: Camera, body: "Shoot vertical (9:16). Studios with natural light look best." },
  { Icon: Film, body: "60-90 seconds is the sweet spot. Tighten before publishing." },
  { Icon: TrendingUp, body: "Link a reel to one of your artworks to enable the Buy CTA." },
  { Icon: Sparkles, body: "Reels are reviewed before going live. Most are approved within hours." },
]

export default function ReelsStudioPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <p className="text-xs uppercase tracking-[0.25em] text-primary">Reels Studio</p>
      <h1 className="mt-2 font-display text-5xl md:text-6xl">
        The studio that shows up beside the canvas.
      </h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Reels are how artists meet collectors mid-process. Show your studio, your
        materials, your hand — and link directly to the work that&apos;s for
        sale.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <Button asChild size="lg">
          <Link href="/artist/dashboard">
            Upload from Studio <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/reels">Watch reels</Link>
        </Button>
      </div>

      <section className="mt-16 grid gap-3 sm:grid-cols-2">
        {TIPS.map((t, i) => (
          <Card key={i}>
            <CardContent className="flex items-start gap-3 p-5">
              <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
                <t.Icon className="size-5" />
              </div>
              <p className="text-sm text-muted-foreground">{t.body}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </article>
  )
}
