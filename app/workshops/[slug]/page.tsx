import { notFound } from "next/navigation"
import Link from "next/link"
import { Calendar, Clock, Radio, Users } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { SmartImage } from "@/components/ui/smart-image"
import { eventJsonLd, JsonLd } from "@/components/seo/JsonLd"
import { getCurrentUser } from "@/lib/auth/rbac"
import { getWorkshopBySlug, isWorkshopRegistered } from "@/lib/data/learning"

import { RegisterWorkshopButton } from "./RegisterWorkshopButton"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const w = await getWorkshopBySlug(slug).catch(() => null)
  if (!w) return { title: "Workshop" }

  const hostName = w.host.full_name ?? `@${w.host.username}`
  const description = w.description ?? `Live workshop by ${hostName} on Dwellika.`

  return {
    title: w.title,
    description,
    keywords: [w.title, hostName, "art workshop", "live class", "learn art", "Dwellika"],
    alternates: { canonical: `/workshops/${w.slug}` },
    openGraph: {
      type: "website" as const,
      url: `/workshops/${w.slug}`,
      title: w.title,
      description,
      images: w.cover_url ? [{ url: w.cover_url, alt: w.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image" as const,
      title: w.title,
      description,
      images: w.cover_url ? [w.cover_url] : undefined,
    },
  }
}

const fmt = (iso: Date | string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

export default async function WorkshopPage({ params }: PageProps) {
  const { slug } = await params
  const workshop = await getWorkshopBySlug(slug)
  if (!workshop) notFound()
  const viewer = await getCurrentUser()
  const registered = await isWorkshopRegistered(workshop.id, viewer?.id)

  const startsAt = new Date(workshop.starts_at).getTime()
  const endsAt = new Date(workshop.ends_at).getTime()
  const now = Date.now()
  const isLiveNow = workshop.is_live && now >= startsAt && now <= endsAt
  const isPast = now > endsAt

  return (
    <div className="relative">
      <JsonLd
        data={eventJsonLd({
          name: workshop.title,
          description: workshop.description,
          url: `/workshops/${workshop.slug}`,
          startsAt: workshop.starts_at,
          endsAt: workshop.ends_at,
          image: workshop.cover_url,
          hostName: workshop.host?.full_name ?? `@${workshop.host?.username}`,
          isVirtual: true,
        })}
      />
      <div className="relative h-64 w-full overflow-hidden md:h-80">
        <SmartImage
          src={workshop.cover_url}
          alt={workshop.title}
          kind="workshop"
          seed={workshop.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="container-page -mt-16 pb-16">
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <header className="space-y-2">
              <div className="flex items-center gap-2">
                {isLiveNow ? (
                  <Badge variant="destructive" className="gap-1">
                    <Radio className="size-3 animate-pulse" /> Live now
                  </Badge>
                ) : isPast ? (
                  <Badge variant="outline">Past</Badge>
                ) : (
                  <Badge variant="secondary">Upcoming</Badge>
                )}
                {Number(workshop.price) === 0 ? <Badge variant="default">Free</Badge> : null}
              </div>
              <h1 className="font-display text-4xl md:text-5xl">{workshop.title}</h1>
              {workshop.host ? (
                <Link
                  href={`/u/${workshop.host.username}`}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Avatar className="size-7">
                    <AvatarImage src={workshop.host.avatar_url ?? undefined} />
                    <AvatarFallback>
                      {(workshop.host.full_name ?? "?").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  hosted by {workshop.host.full_name ?? `@${workshop.host.username}`}
                </Link>
              ) : null}
            </header>

            {workshop.description ? (
              <Card>
                <CardContent className="p-5">
                  <p className="whitespace-pre-line text-foreground/90">{workshop.description}</p>
                </CardContent>
              </Card>
            ) : null}

            {isPast && workshop.recording_url ? (
              <Card>
                <CardContent className="p-5">
                  <h2 className="mb-3 font-display text-xl">Recording</h2>
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video src={workshop.recording_url} controls className="w-full rounded-xl" />
                </CardContent>
              </Card>
            ) : null}

            {isLiveNow && registered && workshop.meeting_url ? (
              <Card>
                <CardContent className="p-5 text-center">
                  <p className="mb-3 text-sm text-muted-foreground">The session is live now.</p>
                  <Link
                    href={workshop.meeting_url}
                    target="_blank"
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  >
                    Join live session →
                  </Link>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardContent className="space-y-4 p-5">
                <p className="font-display text-3xl">
                  {Number(workshop.price) === 0
                    ? "Free"
                    : `${workshop.currency} ${Number(workshop.price).toLocaleString()}`}
                </p>

                <RegisterWorkshopButton
                  workshopId={workshop.id}
                  initialRegistered={registered}
                  isAuthed={Boolean(viewer)}
                  isPast={isPast}
                />

                <div className="space-y-2 border-t border-border pt-3 text-xs">
                  <Stat Icon={Calendar} label="Starts" value={fmt(workshop.starts_at)} />
                  <Stat Icon={Clock} label="Ends" value={fmt(workshop.ends_at)} />
                  {workshop.capacity ? (
                    <Stat Icon={Users} label="Capacity" value={String(workshop.capacity)} />
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}

function Stat({ Icon, label, value }: { Icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-3.5 text-muted-foreground" />
      <div>
        <p>{value}</p>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
