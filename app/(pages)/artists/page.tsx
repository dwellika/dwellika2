import { Search } from "lucide-react"

import { ArtistCard } from "@/components/artists/ArtistCard"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { getCurrentUser } from "@/lib/auth/rbac"
import { listArtists } from "@/lib/data/artists"
import { MOCK_ARTISTS } from "@/lib/mock/artists"
import type { ArtistCardRow } from "@/lib/data/types"

export const metadata = {
  title: "Artists",
  description: "Discover the artists shaping Dwellika.",
}

export const revalidate = 120

const MEDIUMS = [
  "Watercolor",
  "Oil",
  "Acrylic",
  "Charcoal",
  "Graphite",
  "Metal",
  "Origami",
  "Sculpture",
  "Clothing",
  "Textile",
  "Digital Art",
  "Mixed Media",
]

interface PageProps {
  searchParams: Promise<{ q?: string; medium?: string }>
}

export default async function ArtistsPage({ searchParams }: PageProps) {
  const { q, medium } = await searchParams
  const viewer = await getCurrentUser()

  const { artists, count } = await listArtists({
    q,
    mediums: medium ? [medium] : undefined,
    limit: 24,
  })

  // First-run friendliness: if there are no artists in DB yet,
  // fall through to mock data so the page isn't empty.
  const usingMock = artists.length === 0
  const display: ArtistCardRow[] = usingMock
    ? MOCK_ARTISTS.map((a) => ({
        id: a.id,
        username: a.username,
        full_name: a.name,
        avatar_url: a.avatar,
        cover_url: a.cover,
        bio: null,
        is_verified: a.verified,
        location: a.location,
        artist_profiles: {
          tier: a.tier,
          specialty: a.specialty,
          styles: [],
          mediums: [a.specialty],
          is_verified: a.verified,
        },
      }))
    : artists

  return (
    <div className="container-page py-12">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">The collective</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">
          {count > 0 ? `${count.toLocaleString()} artists` : "Artists"}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Search by name, username, or style. Filter by medium. Follow the
          studios that move you.
        </p>
      </header>

      {/* Search + filters */}
      <form className="mb-8 flex flex-col gap-4">
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search artists, styles, tags…"
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <FilterPill href="/artists" label="All" active={!medium} />
          {MEDIUMS.map((m) => (
            <FilterPill
              key={m}
              href={`/artists?medium=${encodeURIComponent(m)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              label={m}
              active={medium === m}
            />
          ))}
        </div>
      </form>

      {/* Grid */}
      {display.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {display.map((a) => (
            <ArtistCard
              key={a.id}
              artist={a}
              isAuthed={Boolean(viewer)}
            />
          ))}
        </div>
      )}

      {usingMock ? (
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Showing curated examples — no artists registered yet.
        </p>
      ) : null}
    </div>
  )
}

function FilterPill({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <a
      href={href}
      className={
        active
          ? "shrink-0 rounded-full border border-primary bg-primary/15 px-3 py-1 text-xs font-medium text-primary"
          : "shrink-0 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
      }
    >
      {label}
    </a>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-16 text-center">
      <p className="font-display text-2xl">No artists match those filters.</p>
      <p className="mt-2 text-muted-foreground">
        Try clearing the filters or broadening your search.
      </p>
      <p className="mt-3">
        <Badge variant="outline">tip: try “watercolor” or “digital”</Badge>
      </p>
    </div>
  )
}
