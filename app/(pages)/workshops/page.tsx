import Link from "next/link"
import { Calendar, Radio } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { SmartImage } from "@/components/ui/smart-image"
import { listWorkshops } from "@/lib/data/learning"

export const metadata = {
  title: "Workshops",
  description: "Live and recorded workshops with the artists who define each medium.",
}

const fmt = (iso: Date | string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

export const dynamic = "force-dynamic"

export default async function WorkshopsPage() {
  const upcoming = await listWorkshops({ upcomingOnly: true, limit: 30 })
  const past = await listWorkshops({ upcomingOnly: false, limit: 30 })
  const pastOnly = past.filter((w) => new Date(w.ends_at).getTime() < Date.now())

  return (
    <div className="container-page pb-12 pt-24 sm:pt-28">
      <header className="relative z-10 mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Learn</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Workshops</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Live sessions and recorded masterclasses with working artists.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="mb-4 font-display text-xl">Upcoming</h2>
        {upcoming.length === 0 ? (
          <Empty />
        ) : (
          <div className="grid gap-3 md:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((w) => (
              <WorkshopCard key={w.id} workshop={w} />
            ))}
          </div>
        )}
      </section>

      {pastOnly.length > 0 ? (
        <section>
          <h2 className="mb-4 font-display text-xl">Past sessions</h2>
          <div className="grid gap-3 md:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pastOnly.map((w) => (
              <WorkshopCard key={w.id} workshop={w} past />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function WorkshopCard({
  workshop,
  past,
}: {
  workshop: Awaited<ReturnType<typeof listWorkshops>>[number]
  past?: boolean
}) {
  return (
    <Link href={`/workshops/${workshop.slug}`}>
      <Card className="group h-full overflow-hidden transition-all hover:border-primary/40">
        <div className="relative aspect-video w-full overflow-hidden">
          <SmartImage
            src={workshop.cover_url}
            alt={workshop.title}
            kind="workshop"
            seed={workshop.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {workshop.is_live && !past ? (
            <Badge variant="destructive" className="absolute left-3 top-3 gap-1">
              <Radio className="size-3 animate-pulse" /> Live
            </Badge>
          ) : null}
        </div>
        <CardContent className="space-y-2 p-4">
          <h3 className="line-clamp-2 font-display text-lg">{workshop.title}</h3>
          {workshop.host ? (
            <p className="text-xs text-muted-foreground">
              by {workshop.host.full_name ?? `@${workshop.host.username}`}
            </p>
          ) : null}
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Calendar className="size-3.5" /> {fmt(workshop.starts_at)}
            </span>
            <span className="font-display text-sm">
              {Number(workshop.price) === 0 ? "Free" : `${workshop.currency} ${Number(workshop.price).toLocaleString()}`}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function Empty() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-12 text-center">
      <p className="font-display text-xl">Nothing scheduled right now</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Check back — masterclasses go up most weeks.
      </p>
    </div>
  )
}
