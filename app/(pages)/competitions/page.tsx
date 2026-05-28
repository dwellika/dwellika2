import Link from "next/link"
import { Trophy, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { SmartImage } from "@/components/ui/smart-image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { listCompetitions } from "@/lib/data/competitions"
import { MOCK_COMPETITIONS } from "@/lib/mock/home"

export const metadata = {
  title: "Competitions",
  description: "Open contests, voting rounds, and a hall of past winners.",
}

function timeLeft(dateStr: string | null) {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff <= 0) return "Closed"
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  if (days >= 1) return `${days}d left`
  return `${hours}h left`
}

export const revalidate = 60

export default async function CompetitionsPage() {
  const all = await listCompetitions({ status: "all", limit: 60 })

  const open = all.filter((c) => c.status === "submissions_open" || c.status === "voting")
  const upcoming = all.filter((c) => c.status === "announced" || c.status === "draft")
  const past = all.filter((c) => c.status === "completed")

  const usingMock = all.length === 0
  const mockOpen = usingMock
    ? MOCK_COMPETITIONS.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: null,
        banner_url: c.banner,
        rules: null,
        prize_pool: c.prize,
        status: "voting" as const,
        submissions_open_at: null,
        submissions_close_at: null,
        voting_open_at: null,
        voting_close_at: c.endsAt,
        announces_at: null,
        category: c.category,
        submission_count: c.participants,
        vote_count: 0,
      }))
    : []

  return (
    <div className="container-page py-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Compete</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Competitions</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Open contests, voting rounds, and a hall of past winners. Pit your
          craft against the world&apos;s best.
        </p>
      </header>

      <Tabs defaultValue="open" className="mt-4">
        <TabsList>
          <TabsTrigger value="open">Open · {usingMock ? mockOpen.length : open.length}</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming · {upcoming.length}</TabsTrigger>
          <TabsTrigger value="past">Past winners · {past.length}</TabsTrigger>
        </TabsList>
        <TabsContent value="open" className="mt-6">
          <Grid items={usingMock ? mockOpen : open} />
        </TabsContent>
        <TabsContent value="upcoming" className="mt-6">
          {upcoming.length === 0 ? <Empty label="upcoming" /> : <Grid items={upcoming} />}
        </TabsContent>
        <TabsContent value="past" className="mt-6">
          {past.length === 0 ? <Empty label="past" /> : <Grid items={past} />}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Grid({ items }: { items: Awaited<ReturnType<typeof listCompetitions>> }) {
  if (items.length === 0) return <Empty label="open" />
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {items.map((c) => (
        <Link key={c.id} href={`/competitions/${c.slug}`}>
          <Card className="group h-full overflow-hidden transition-all hover:border-primary/40">
            <div className="relative h-44 w-full overflow-hidden">
              <SmartImage
                src={c.banner_url}
                alt={c.title}
                kind="competition"
                seed={c.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="image-overlay-strong absolute inset-0" />
              {c.category ? (
                <Badge variant="secondary" className="absolute left-3 top-3 gap-1 backdrop-blur">
                  <Trophy className="size-3" /> {c.category}
                </Badge>
              ) : null}
              <div className="absolute inset-x-3 bottom-3 text-white">
                <p className="font-display text-lg leading-tight">{c.title}</p>
              </div>
            </div>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3.5" /> {c.submission_count} entries
                </span>
                {c.status === "voting"
                  ? <span className="font-medium text-primary">{timeLeft(c.voting_close_at) ?? "Voting"}</span>
                  : c.status === "submissions_open"
                  ? <span className="font-medium text-secondary">{timeLeft(c.submissions_close_at) ?? "Open"}</span>
                  : <span className="capitalize">{c.status.replace("_", " ")}</span>}
              </div>
              {c.prize_pool ? (
                <p className="text-xs text-muted-foreground">Prize · {c.prize_pool}</p>
              ) : null}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-12 text-center">
      <p className="font-display text-xl">No {label} competitions right now</p>
      <p className="mt-1 text-sm text-muted-foreground">Check back soon — we run monthly challenges.</p>
    </div>
  )
}
