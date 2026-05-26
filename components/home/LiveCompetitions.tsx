"use client"

import Link from "next/link"
import { Trophy, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SmartImage } from "@/components/ui/smart-image"
import { MOCK_COMPETITIONS, type MockCompetition } from "@/lib/mock/home"

import { Section } from "./Section"
import { useCountdown } from "./useCountdown"

function CompetitionCard({ c }: { c: MockCompetition }) {
  const cd = useCountdown(c.endsAt)
  return (
    <Card className="group relative overflow-hidden border-border bg-card">
      <div className="relative h-44 w-full overflow-hidden">
        <SmartImage
          src={c.banner}
          alt={c.title}
          kind="competition"
          seed={c.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="image-overlay-strong absolute inset-0" />
        <Badge className="absolute left-3 top-3 gap-1 backdrop-blur" variant="secondary">
          <Trophy className="size-3" /> {c.category}
        </Badge>
        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between text-white">
          <p className="font-display text-lg leading-tight">{c.title}</p>
        </div>
      </div>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" /> {c.participants} entries
          </span>
          <span>{c.prize}</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { v: cd.days, l: "Days" },
            { v: cd.hours, l: "Hours" },
            { v: cd.minutes, l: "Min" },
            { v: cd.seconds, l: "Sec" },
          ].map((t) => (
            <div
              key={t.l}
              className="rounded-md bg-muted/40 px-2 py-1 text-center"
            >
              <p className="font-display text-base tabular-nums">
                {String(t.v).padStart(2, "0")}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {t.l}
              </p>
            </div>
          ))}
        </div>

        <Button asChild className="w-full">
          <Link href={`/competitions/${c.slug}`}>Enter the contest</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export function LiveCompetitions() {
  return (
    <Section
      eyebrow="Compete"
      title="Live competitions"
      description="Pit your craft against the world's best. New challenges every week."
      href="/competitions"
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_COMPETITIONS.map((c) => (
          <CompetitionCard key={c.id} c={c} />
        ))}
      </div>
    </Section>
  )
}
