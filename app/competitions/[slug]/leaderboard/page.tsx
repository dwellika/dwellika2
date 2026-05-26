import { notFound } from "next/navigation"
import Link from "next/link"
import { Trophy } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SmartImage } from "@/components/ui/smart-image"
import { getCompetitionBySlug, listSubmissions } from "@/lib/data/competitions"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function LeaderboardPage({ params }: PageProps) {
  const { slug } = await params
  const comp = await getCompetitionBySlug(slug)
  if (!comp) notFound()
  const subs = await listSubmissions(comp.id, { sort: "top", limit: 100 })

  return (
    <div className="container-page py-12">
      <header className="mb-8">
        <Link
          href={`/competitions/${slug}`}
          className="text-xs uppercase tracking-[0.25em] text-primary hover:underline"
        >
          ← {comp.title}
        </Link>
        <h1 className="mt-2 font-display text-4xl">Leaderboard</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <Trophy className="size-5 text-amber-400" /> Top entries
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {subs.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 px-5 py-3">
              <span className="w-6 text-center font-display text-lg tabular-nums text-muted-foreground">
                {i + 1}
              </span>
              <div className="relative size-12 shrink-0 overflow-hidden rounded-md">
                <SmartImage
                  src={s.media_url}
                  alt={s.title}
                  kind="artwork"
                  seed={s.title}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-medium">{s.title}</p>
                {s.artist?.username ? (
                  <Link
                    href={`/u/${s.artist.username}`}
                    className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Avatar className="size-5">
                      <AvatarImage src={s.artist.avatar_url ?? undefined} />
                      <AvatarFallback>{(s.artist.full_name ?? "?").slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    @{s.artist.username}
                  </Link>
                ) : null}
              </div>
              <p className="font-display text-lg tabular-nums">{s.vote_count}</p>
            </div>
          ))}
          {subs.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-muted-foreground">
              No submissions yet.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
