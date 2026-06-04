import Link from "next/link"
import { BadgeCheck, MapPin, Users } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SmartImage } from "@/components/ui/smart-image"
import type { HomeStudio } from "@/lib/data/homepage"

import { Section } from "./Section"

export function BestStudios({ studios }: { studios: HomeStudio[] }) {
  if (!studios || studios.length === 0) return null

  return (
    <Section
      eyebrow="Studios"
      title="The best of the studios"
      description="The most active studios on Dwellika — by following and published work."
      href="/artists"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {studios.map((s) => (
          <Link
            key={s.id}
            href={`/u/${s.username}`}
            className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="relative h-28 w-full overflow-hidden">
              <SmartImage
                src={s.cover}
                alt={`${s.name} cover`}
                kind="cover"
                seed={s.name}
                fill
                sizes="(max-width: 768px) 100vw, 280px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="image-overlay-strong absolute inset-0" />
              {s.promoted ? (
                <Badge className="absolute left-3 top-3 bg-primary/90 text-primary-foreground backdrop-blur">
                  Featured
                </Badge>
              ) : null}
            </div>

            <div className="-mt-8 px-4 pb-4">
              <Avatar className="size-16 ring-4 ring-card">
                <AvatarImage src={s.avatar ?? undefined} alt={s.name} />
                <AvatarFallback>{s.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="mt-2 flex items-center gap-1">
                <p className="truncate font-display text-lg leading-tight">{s.name}</p>
                {s.verified ? <BadgeCheck className="size-4 shrink-0 text-primary" /> : null}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {s.specialty}
                {s.location ? (
                  <>
                    {" "}· <MapPin className="inline size-2.5" /> {s.location}
                  </>
                ) : null}
              </p>

              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3.5" /> {s.members.toLocaleString()} members
                </span>
                <span>{s.works} works</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  )
}
