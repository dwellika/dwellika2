import { notFound } from "next/navigation"
import Link from "next/link"
import { Calendar, Trophy, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SmartImage } from "@/components/ui/smart-image"
import { getCurrentUser } from "@/lib/auth/rbac"
import { prisma } from "@/lib/prisma"
import { MOCK_COMPETITIONS } from "@/lib/mock/home"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ slug: string }>
}

interface CompetitionView {
  title: string
  description: string | null
  banner: string | null
  category: string | null
  prize: string | null
  participants: number
  status: string
  endsAt: Date | null
  rules: string | null
}

async function getCompetition(slug: string): Promise<CompetitionView | null> {
  const db = await prisma.competition.findUnique({ where: { slug } }).catch(() => null)
  if (db) {
    return {
      title: db.title,
      description: db.description,
      banner: db.banner_url,
      category: db.category,
      prize: db.prize_pool,
      participants: db.submission_count,
      status: db.status,
      endsAt: db.voting_close_at ?? db.submissions_close_at ?? null,
      rules: db.rules,
    }
  }

  const m = MOCK_COMPETITIONS.find((x) => x.slug === slug)
  if (m) {
    return {
      title: m.title,
      description: null,
      banner: m.banner,
      category: m.category,
      prize: m.prize,
      participants: m.participants,
      status: "voting",
      endsAt: new Date(m.endsAt),
      rules: null,
    }
  }

  return null
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const c = await getCompetition(slug)
  return {
    title: c?.title ?? "Competition",
    description: c?.description ?? (c ? `${c.title} — enter the contest on Dwellika.` : undefined),
  }
}

function timeLeft(date: Date | null): string {
  if (!date) return "Open"
  const diff = new Date(date).getTime() - Date.now()
  if (diff <= 0) return "Closed"
  const days = Math.floor(diff / 86_400_000)
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"} left`
  const hours = Math.floor(diff / 3_600_000)
  return `${hours} hour${hours === 1 ? "" : "s"} left`
}

export default async function CompetitionDetailPage({ params }: PageProps) {
  const { slug } = await params
  const competition = await getCompetition(slug)
  if (!competition) notFound()

  const viewer = await getCurrentUser()
  const isOpen = competition.status === "submissions_open" || competition.status === "voting"

  return (
    <div className="relative">
      {/* Banner */}
      <div className="relative h-56 w-full overflow-hidden md:h-80">
        <SmartImage
          src={competition.banner}
          alt={competition.title}
          kind="competition"
          seed={competition.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      {/* relative z-10 keeps the heading above the positioned banner */}
      <div className="container-page relative z-10 -mt-20 pb-16">
        <header className="mb-8">
          {competition.category ? (
            <Badge variant="secondary" className="gap-1">
              <Trophy className="size-3" /> {competition.category}
            </Badge>
          ) : null}
          <h1 className="mt-3 font-display text-4xl md:text-5xl">{competition.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-4" /> {competition.participants.toLocaleString()} entries
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-4" /> {timeLeft(competition.endsAt)}
            </span>
            <Badge variant="outline" className="capitalize">
              {competition.status.replace(/_/g, " ")}
            </Badge>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            {competition.description ? (
              <section>
                <h2 className="mb-2 font-display text-2xl">About</h2>
                <p className="whitespace-pre-line text-muted-foreground">{competition.description}</p>
              </section>
            ) : (
              <p className="text-muted-foreground">
                Compete with artists across Dwellika. Submit your best work before the deadline,
                then the community votes for the winners.
              </p>
            )}

            {competition.rules ? (
              <section>
                <h2 className="mb-2 font-display text-2xl">Rules</h2>
                <p className="whitespace-pre-line text-muted-foreground">{competition.rules}</p>
              </section>
            ) : null}
          </div>

          {/* Entry panel */}
          <aside className="space-y-4 rounded-2xl border border-border bg-card p-6">
            {competition.prize ? (
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Prize</p>
                <p className="mt-1 font-display text-xl">{competition.prize}</p>
              </div>
            ) : null}

            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Deadline</p>
              <p className="mt-1 font-medium">{timeLeft(competition.endsAt)}</p>
            </div>

            {!viewer ? (
              <Button asChild className="w-full" disabled={!isOpen}>
                <Link href={`/signin?next=/competitions/${slug}`}>
                  {isOpen ? "Sign in to enter" : "Submissions closed"}
                </Link>
              </Button>
            ) : isOpen ? (
              <Button asChild className="w-full">
                <Link href="/artist/artworks/new">Submit your entry</Link>
              </Button>
            ) : (
              <Button className="w-full" disabled>
                Submissions closed
              </Button>
            )}

            <Button asChild variant="outline" className="w-full">
              <Link href="/competitions">Browse all competitions</Link>
            </Button>
          </aside>
        </div>
      </div>
    </div>
  )
}
