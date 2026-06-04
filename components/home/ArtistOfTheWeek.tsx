import Link from "next/link"
import { Sparkles } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SmartImage } from "@/components/ui/smart-image"
import { getFollowCounts } from "@/lib/data/artists"
import { listArtworks } from "@/lib/data/artworks"
import { prisma } from "@/lib/prisma"
import { MOCK_ARTISTS } from "@/lib/mock/artists"
import { MOCK_ARTWORKS } from "@/lib/mock/artworks"

import { Section } from "./Section"

interface SpotlightData {
  name: string
  username: string
  specialty: string
  location: string
  bio: string
  avatar: string | null
  followers: number
  works: number
  images: Array<{ id: string; title: string; image: string | null }>
}

// Reads the admin-curated Artist of the Week, falling back to the first mock
// artist when none is set (or the DB is unreachable).
async function resolveSpotlight(): Promise<SpotlightData> {
  const feature = await prisma.homepageFeature
    .findFirst({ where: { section: "artist_of_week", is_active: true } })
    .catch(() => null)

  if (feature) {
    const user = await prisma.user
      .findUnique({
        where: { id: feature.entity_id },
        select: {
          id: true, username: true, full_name: true, avatar_url: true, bio: true, location: true,
          artist_profile: { select: { specialty: true } },
        },
      })
      .catch(() => null)

    if (user?.username) {
      const [{ artworks }, follows] = await Promise.all([
        listArtworks({ artistId: user.id, limit: 3 }).catch(() => ({ artworks: [] as Awaited<ReturnType<typeof listArtworks>>["artworks"] })),
        getFollowCounts(user.id).catch(() => ({ followers: 0, following: 0 })),
      ])
      return {
        name: user.full_name ?? `@${user.username}`,
        username: user.username,
        specialty: user.artist_profile?.specialty ?? "Artist",
        location: user.location ?? "",
        bio: user.bio ?? "Hand-picked by the Dwellika curation team this week.",
        avatar: user.avatar_url,
        followers: follows.followers,
        works: artworks.length,
        images: artworks.map((a) => ({
          id: a.id,
          title: a.title,
          image: a.artwork_media?.[0]?.url ?? null,
        })),
      }
    }
  }

  // Fallback to mock
  const artist = MOCK_ARTISTS[0]
  const works = MOCK_ARTWORKS.filter((w) => w.artistId === artist.id)
  const display = (works.length ? works : MOCK_ARTWORKS).slice(0, 3)
  return {
    name: artist.name,
    username: artist.username,
    specialty: artist.specialty,
    location: artist.location,
    bio: "Hand-picked by the Dwellika curation team this week.",
    avatar: artist.avatar,
    followers: artist.followers,
    works: artist.works,
    images: display.map((w) => ({ id: w.id, title: w.title, image: w.image })),
  }
}

export async function ArtistOfTheWeek() {
  const s = await resolveSpotlight().catch(() => null)
  if (!s) return null

  const weekOf = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })
  const display = s.images.slice(0, 3)

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
            <h3 className="mt-4 font-display text-4xl md:text-5xl">{s.name}</h3>
            <p className="mt-1 text-muted-foreground">
              {s.specialty}{s.location ? ` · ${s.location}` : ""}
            </p>

            <p className="mt-6 max-w-md text-base text-foreground/90">{s.bio}</p>

            <div className="mt-6 flex items-center gap-3">
              <Avatar className="size-12 ring-2 ring-primary/30">
                <AvatarImage src={s.avatar ?? undefined} alt={s.name} />
                <AvatarFallback>{s.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">@{s.username}</p>
                <p className="text-xs text-muted-foreground">
                  {s.followers.toLocaleString()} followers · {s.works} works
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button asChild>
                <Link href={`/u/${s.username}`}>Visit the gallery</Link>
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
