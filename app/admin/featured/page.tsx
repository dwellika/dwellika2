import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SmartImage } from "@/components/ui/smart-image"
import { requireRole } from "@/lib/auth/rbac"
import { prisma } from "@/lib/prisma"

import { EvaluateForm } from "./EvaluateForm"

export const metadata = { title: "Admin · Featured submissions" }
export const dynamic = "force-dynamic"

export default async function AdminFeaturedPage() {
  await requireRole("admin", "super_admin")

  const submissions = await prisma.featuredSubmission
    .findMany({ where: { status: "pending" }, orderBy: { created_at: "asc" } })
    .catch(() => [])

  // Scalar refs — fetch artwork + artist details separately, then join.
  const artworkIds = submissions.map((s) => s.artwork_id)
  const artistIds = submissions.map((s) => s.artist_id)
  const [artworks, artists] = await Promise.all([
    prisma.artwork.findMany({
      where: { id: { in: artworkIds } },
      select: { id: true, title: true, slug: true, artwork_media: { where: { is_primary: true }, take: 1, select: { url: true } } },
    }),
    prisma.user.findMany({
      where: { id: { in: artistIds } },
      select: { id: true, username: true, full_name: true },
    }),
  ])
  const artworkMap = new Map(artworks.map((a) => [a.id, a]))
  const artistMap = new Map(artists.map((a) => [a.id, a]))

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Featured submissions</h1>
        <p className="mt-1 text-muted-foreground">
          Score each submission on the six weighted components — the Feature Score is computed automatically.
        </p>
      </header>

      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-12 text-center">
          <p className="font-display text-xl">No pending submissions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => {
            const art = artworkMap.get(s.artwork_id)
            const artist = artistMap.get(s.artist_id)
            return (
              <Card key={s.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-md">
                      <SmartImage
                        src={art?.artwork_media[0]?.url ?? null}
                        alt={art?.title ?? "Artwork"}
                        kind="artwork"
                        seed={art?.title ?? s.artwork_id}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base">{art?.title ?? "Untitled"}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        by{" "}
                        {artist?.username ? (
                          <Link href={`/u/${artist.username}`} className="hover:underline">
                            {artist.full_name ?? `@${artist.username}`}
                          </Link>
                        ) : (
                          artist?.full_name ?? "Unknown"
                        )}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-auto">Pending</Badge>
                  </div>
                  {s.pitch ? <p className="mt-2 text-sm text-muted-foreground">“{s.pitch}”</p> : null}
                </CardHeader>
                <CardContent>
                  <EvaluateForm submissionId={s.id} />
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
