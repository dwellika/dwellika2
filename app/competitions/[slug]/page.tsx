import { notFound } from "next/navigation"
import Link from "next/link"
import { Calendar, Sparkles, Trophy, Upload } from "lucide-react"

import { VoteButton } from "@/components/competitions/VoteButton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SmartImage } from "@/components/ui/smart-image"
import { getCurrentUser } from "@/lib/auth/rbac"
import {
  getCompetitionBySlug,
  getMySubmission,
  getMyVotes,
  listSubmissions,
  listWinners,
} from "@/lib/data/competitions"

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ submitted?: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const c = await getCompetitionBySlug(slug).catch(() => null)
  if (!c) return { title: "Competition" }

  const description = c.description ?? `Join ${c.title} — an art competition on Dwellika.`

  return {
    title: c.title,
    description,
    keywords: [c.title, "art competition", "win prizes", "submit artwork", "Dwellika"],
    alternates: { canonical: `/competitions/${c.slug}` },
    openGraph: {
      type: "website" as const,
      url: `/competitions/${c.slug}`,
      title: c.title,
      description,
      images: c.banner_url ? [{ url: c.banner_url, alt: c.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image" as const,
      title: c.title,
      description,
      images: c.banner_url ? [c.banner_url] : undefined,
    },
  }
}

export default async function CompetitionDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { submitted } = await searchParams
  const comp = await getCompetitionBySlug(slug)
  if (!comp) notFound()

  const viewer = await getCurrentUser()
  const [subs, winners, myVotes, mySub] = await Promise.all([
    listSubmissions(comp.id, { sort: "top", limit: 60 }),
    comp.status === "completed" ? listWinners(comp.id) : Promise.resolve([]),
    getMyVotes(comp.id, viewer?.id),
    getMySubmission(comp.id, viewer?.id),
  ])

  const isVoting = comp.status === "voting"
  const isSubmissionsOpen = comp.status === "submissions_open"

  return (
    <div className="relative">
      <div className="relative h-64 w-full overflow-hidden md:h-80">
        <SmartImage
          src={comp.banner_url}
          alt={comp.title}
          kind="competition"
          seed={comp.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="container-page absolute inset-x-0 bottom-6 z-10 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              {comp.category ? <Badge variant="secondary"><Trophy className="mr-1 size-3" /> {comp.category}</Badge> : null}
              <Badge variant="outline" className="capitalize">{comp.status.replace("_", " ")}</Badge>
            </div>
            <h1 className="mt-2 font-display text-4xl md:text-5xl">{comp.title}</h1>
            {comp.prize_pool ? (
              <p className="mt-1 text-muted-foreground">
                <Sparkles className="inline size-3.5 text-primary" /> {comp.prize_pool}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="container-page pb-16 pt-8">
        {submitted === "1" ? (
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            Submission received — it&apos;ll appear after review.
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            {comp.description ? (
              <Card>
                <CardContent className="space-y-3 p-5">
                  <h2 className="font-display text-xl">About this competition</h2>
                  <p className="whitespace-pre-line text-foreground/90">{comp.description}</p>
                  {comp.rules ? (
                    <>
                      <h3 className="mt-3 font-medium">Rules</h3>
                      <p className="whitespace-pre-line text-sm text-muted-foreground">{comp.rules}</p>
                    </>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}

            {comp.status === "completed" && winners.length > 0 ? (
              <Card>
                <CardContent className="space-y-4 p-5">
                  <h2 className="font-display text-2xl">Winners</h2>
                  <div className="grid gap-4 md:grid-cols-3">
                    {winners.map((w) => (
                      <div key={w.id} className="overflow-hidden rounded-xl border border-border bg-card">
                        <div className="relative aspect-square w-full overflow-hidden">
                          <SmartImage
                            src={w.submission?.media_url}
                            alt={w.submission?.title ?? "Winning submission"}
                            kind="artwork"
                            seed={w.submission?.title ?? w.id}
                            fill
                            sizes="33vw"
                            className="object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <Badge className="mb-1">Rank {w.rank}</Badge>
                          <p className="line-clamp-1 text-sm font-medium">{w.submission?.title}</p>
                          {w.submission?.artist?.username ? (
                            <Link
                              href={`/u/${w.submission.artist.username}`}
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              @{w.submission.artist.username}
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <section>
              <h2 className="mb-4 font-display text-2xl">
                {isVoting ? "Vote for your favorite" : isSubmissionsOpen ? "Recent submissions" : "Submissions"}
              </h2>
              {subs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-12 text-center">
                  <p className="font-display text-xl">No submissions yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {isSubmissionsOpen
                      ? "Be the first to submit your work."
                      : "Check back during the submission window."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-3">
                  {subs.map((s) => {
                    const voted = myVotes.has(s.id)
                    return (
                      <Card key={s.id} className="overflow-hidden">
                        <div className="relative aspect-square w-full overflow-hidden">
                          <SmartImage
                            src={s.media_url}
                            alt={s.title}
                            kind="artwork"
                            seed={s.title}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                        <CardContent className="space-y-2 p-3">
                          <p className="line-clamp-1 font-medium">{s.title}</p>
                          {s.artist?.username ? (
                            <Link
                              href={`/u/${s.artist.username}`}
                              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                            >
                              <Avatar className="size-5">
                                <AvatarImage src={s.artist.avatar_url ?? undefined} />
                                <AvatarFallback>{(s.artist.full_name ?? "?").slice(0, 2)}</AvatarFallback>
                              </Avatar>
                              @{s.artist.username}
                            </Link>
                          ) : null}
                          <VoteButton
                            submissionId={s.id}
                            initialVoted={voted}
                            initialCount={s.vote_count}
                            isAuthed={Boolean(viewer)}
                            disabled={!isVoting || s.artist_id === viewer?.id}
                          />
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardContent className="space-y-3 p-5">
                <h3 className="font-display text-lg">Timeline</h3>
                <Phase
                  active={comp.status === "submissions_open"}
                  label="Submissions"
                  date={comp.submissions_close_at}
                  caption="closes"
                />
                <Phase
                  active={comp.status === "voting"}
                  label="Voting"
                  date={comp.voting_close_at}
                  caption="closes"
                />
                <Phase
                  active={comp.status === "completed"}
                  label="Winners announced"
                  date={comp.announces_at}
                  caption="announced"
                />
              </CardContent>
            </Card>

            {isSubmissionsOpen ? (
              <Card>
                <CardContent className="space-y-3 p-5">
                  {mySub ? (
                    <>
                      <p className="font-medium">Your submission</p>
                      <p className="text-sm text-muted-foreground">{mySub.title}</p>
                      <Badge variant="outline" className="capitalize">{mySub.status}</Badge>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">Submit your entry</p>
                      <p className="text-sm text-muted-foreground">
                        One submission per artist. You can update yours until the window closes.
                      </p>
                      <Button asChild className="w-full">
                        <Link href={`/competitions/${comp.slug}/submit`}>
                          <Upload className="size-4" /> Enter the contest
                        </Link>
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">
                  Leaderboard updates live during the voting phase.
                </p>
                <Button asChild variant="outline" className="mt-3 w-full">
                  <Link href={`/competitions/${comp.slug}/leaderboard`}>
                    See leaderboard
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}

function Phase({
  active,
  label,
  date,
  caption,
}: {
  active: boolean
  label: string
  date: string | null
  caption: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={
          active
            ? "grid size-6 place-items-center rounded-full bg-primary text-primary-foreground"
            : "grid size-6 place-items-center rounded-full border border-border text-muted-foreground"
        }
      >
        <Calendar className="size-3" />
      </span>
      <div>
        <p className={active ? "font-medium" : "text-muted-foreground"}>{label}</p>
        {date ? (
          <p className="text-xs text-muted-foreground">
            {caption} {new Date(date).toLocaleString()}
          </p>
        ) : null}
      </div>
    </div>
  )
}
