import Link from "next/link"
import { Search } from "lucide-react"

import { CommunityCard } from "@/components/communities/CommunityCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { listCommunities } from "@/lib/data/communities"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Communities",
  description: "Studios, schools of thought, and craft groups across Dwellika.",
}

const CATEGORIES = [
  "Watercolor",
  "Oil",
  "Sculpture",
  "Origami",
  "Digital",
  "Textile",
  "Charcoal",
  "Mixed Media",
]

const PAGE_SIZE = 24

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>
}

export default async function CommunitiesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { q, category, page: pageStr } = params
  const page = Math.max(1, Number(pageStr ?? 1) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const { communities, count } = await listCommunities({
    q,
    category,
    limit: PAGE_SIZE,
    offset,
  }).catch(() => ({ communities: [], count: 0 }))

  return (
    <div className="container-page pb-12 pt-16 sm:pt-20">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Communities</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">
          {count > 0 ? `${count.toLocaleString()} circles` : "Communities"}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Find your school of thought. Watercolorists, sculptors, digital
          painters — discussing technique, sharing breakdowns, running events.
        </p>
      </header>

      {/* Plain GET form: browser navigates to /communities?q=...&category=... */}
      <form className="mb-8 space-y-4">
        <div className="relative flex max-w-xl gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="q" defaultValue={q ?? ""} placeholder="Search communities…" className="pl-9" />
          </div>
          <Button type="submit" variant="outline" size="icon" aria-label="Search">
            <Search className="size-4" />
          </Button>
        </div>

        {/* Preserve active category when the search form is submitted */}
        {category && <input type="hidden" name="category" value={category} />}

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {/* "All" pill preserves any active search query */}
          <Pill
            href={q ? `/communities?q=${encodeURIComponent(q)}` : "/communities"}
            label="All"
            active={!category}
          />
          {CATEGORIES.map((c) => (
            <Pill
              key={c}
              href={`/communities?category=${encodeURIComponent(c)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              label={c}
              active={category === c}
            />
          ))}
        </div>
      </form>

      {communities.length === 0 ? (
        <Empty />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {communities.map((c) => (
              <CommunityCard key={c.id} community={c} />
            ))}
          </div>

          <PaginationControls
            page={page}
            totalCount={count}
            pageSize={PAGE_SIZE}
            searchParams={params as Record<string, string | undefined>}
            basePath="/communities"
          />
        </>
      )}
    </div>
  )
}

function Pill({ href, label, active }: { href: string; label: string; active: boolean }) {
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

function Empty() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-16 text-center">
      <p className="font-display text-2xl">No communities match those filters.</p>
      <p className="mt-2 text-muted-foreground">
        Communities are seeded by the Dwellika team — check back soon.
      </p>
    </div>
  )
}
