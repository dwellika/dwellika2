import Link from "next/link"
import { Sparkles } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SmartImage } from "@/components/ui/smart-image"
import { MOCK_ARTISTS } from "@/lib/mock/artists"
import { MOCK_ARTWORKS } from "@/lib/mock/artworks"

import { Section } from "./Section"

export function ArtistOfTheWeek() {
  const artist = MOCK_ARTISTS[0]
  const works = MOCK_ARTWORKS.filter((w) => w.artistId === artist.id).slice(0, 3)
  const filler = MOCK_ARTWORKS.slice(0, 3)
  const display = (works.length ? works : filler).slice(0, 3)

  const weekOf = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })

  return (
    <Section eyebrow="Spotlight" title="Artist of the week">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.25), transparent 40%), radial-gradient(circle at 80% 30%, hsl(var(--accent) / 0.25), transparent 40%)",
          }}
        />

        <div className="relative grid gap-8 p-8 md:grid-cols-2 md:p-12">
          <div>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="size-3" /> Week of {weekOf}
            </Badge>
            <h3 className="mt-4 font-display text-4xl md:text-5xl">{artist.name}</h3>
            <p className="mt-1 text-muted-foreground">
              {artist.specialty} · {artist.location}
            </p>

            <p className="mt-6 max-w-md text-base text-foreground/90">
              Mira&apos;s monsoon-soaked watercolors collapse storms into stillness — a
              practiced patience that has earned her a master tier and a sold-out
              spring season.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <Avatar className="size-12 ring-2 ring-primary/30">
                <AvatarImage src={artist.avatar} alt={artist.name} />
                <AvatarFallback>{artist.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">@{artist.username}</p>
                <p className="text-xs text-muted-foreground">
                  {artist.followers.toLocaleString()} followers · {artist.works} works
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button asChild>
                <Link href={`/u/${artist.username}`}>Visit the gallery</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/competitions">See the contest</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {display.map((w, i) => (
              <figure
                key={w.id}
                className={
                  i === 0
                    ? "col-span-2 row-span-2 overflow-hidden rounded-2xl"
                    : "overflow-hidden rounded-2xl"
                }
              >
                <div className="relative aspect-square w-full">
                  <SmartImage
                    src={w.image}
                    alt={w.title}
                    kind="artwork"
                    seed={w.title}
                    fill
                    sizes="(max-width: 768px) 33vw, 25vw"
                    className="object-cover"
                  />
                </div>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
