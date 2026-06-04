import Link from "next/link"
import { Search } from "lucide-react"

import { ArtistCard } from "@/components/artists/ArtistCard"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { getCurrentUser } from "@/lib/auth/rbac"
import { listArtists } from "@/lib/data/artists"
import { MOCK_ARTISTS } from "@/lib/mock/artists"
import type { ArtistCardRow } from "@/lib/data/types"

export const metadata = {
  title: "Artists",
  description: "Discover the artists shaping Dwellika.",
}

export const dynamic = "force-dynamic"

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

const PAGE_SIZE = 24

interface PageProps {
  searchParams: Promise<{ q?: string; medium?: string; page?: string }>
}

export default async function ArtistsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { q, medium, page: pageStr } = params
  const page = Math.max(1, Number(pageStr ?? 1) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const viewer = await getCurrentUser()

  const { artists, count } = await listArtists({
    q,
    mediums: medium ? [medium] : undefined,
    limit: PAGE_SIZE,
    offset,
  }).catch(() => ({ artists: [], count: 0 }))

  // Only fall back to curated mock artists on a truly empty catalogue (no search
  // or filter applied). When a filter IS active, an empty result must show the
  // empty state — otherwise unfiltered mock data makes the filter look broken.
  const hasActiveFilter = Boolean(q || medium)
  const usingMock = !hasActiveFilter && artists.length === 0 && count === 0
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
    <div className="container-page pb-12 pt-16 sm:pt-20">
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

      {/* Search + filters — plain GET form preserves all active params */}
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
        {/* Hidden input preserves the active medium when the search form is submitted */}
        {medium && <input type="hidden" name="medium" value={medium} />}

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {/* "All" pill preserves any active search query */}
          <FilterPill
            href={q ? `/artists?q=${encodeURIComponent(q)}` : "/artists"}
            label="All"
            active={!medium}
          />
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

      {display.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {display.map((a) => (
              <ArtistCard
                key={a.id}
                artist={a}
                isAuthed={Boolean(viewer)}
              />
            ))}
          </div>

          {usingMock ? (
            <p className="mt-8 text-center text-xs text-muted-foreground">
              Showing curated examples — no artists registered yet.
            </p>
          ) : (
            <PaginationControls
              page={page}
              totalCount={count}
              pageSize={PAGE_SIZE}
              searchParams={params as Record<string, string | undefined>}
              basePath="/artists"
            />
          )}
        </>
      )}
    </div>
  )
}

function FilterPill({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={
        active
          ? "shrink-0 rounded-full border border-primary bg-primary/15 px-3 py-1 text-xs font-medium text-primary"
          : "shrink-0 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
      }
    >
      {label}
    </Link>
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
        <Badge variant="outline">tip: try "watercolor" or "digital"</Badge>
      </p>
    </div>
  )
}
