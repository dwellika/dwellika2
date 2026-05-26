"use client"

import Link from "next/link"
import { Calendar, Radio } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SmartImage } from "@/components/ui/smart-image"
import { MOCK_WORKSHOPS } from "@/lib/mock/home"

import { Section } from "./Section"

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

export function UpcomingWorkshops() {
  return (
    <Section
      eyebrow="Learn"
      title="Upcoming workshops"
      description="Live sessions with the artists who define the medium."
      href="/workshops"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {MOCK_WORKSHOPS.map((w) => (
          <Card key={w.id} className="overflow-hidden">
            <div className="relative h-40 w-full overflow-hidden">
              <SmartImage
                src={w.cover}
                alt={w.title}
                kind="workshop"
                seed={w.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
              {w.isLive ? (
                <Badge variant="destructive" className="absolute left-3 top-3 gap-1">
                  <Radio className="size-3 animate-pulse" /> Live
                </Badge>
              ) : null}
            </div>
            <CardContent className="space-y-3 p-5">
              <h3 className="line-clamp-2 font-display text-lg">{w.title}</h3>
              <p className="text-sm text-muted-foreground">
                Hosted by <span className="text-foreground">{w.host}</span>
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="size-3.5" /> {fmtDate(w.startsAt)}
              </div>
              <div className="flex items-center justify-between">
                <p className="font-display text-base">
                  {w.price === 0 ? "Free" : `₹${w.price.toLocaleString()}`}
                </p>
                <Button asChild size="sm">
                  <Link href={`/workshops/${w.id}`}>{w.isLive ? "Join live" : "Reserve"}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  )
}
