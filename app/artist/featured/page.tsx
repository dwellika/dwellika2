import { Sparkles } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SmartImage } from "@/components/ui/smart-image"
import { requireRole } from "@/lib/auth/rbac"
import { prisma } from "@/lib/prisma"

import { SubmitFeaturedButton } from "./SubmitButton"

export const metadata = { title: "Featured collection · Dwellika" }
export const dynamic = "force-dynamic"

export default async function ArtistFeaturedPage() {
  const user = await requireRole("artist", "admin", "super_admin")

  const [artworks, submissions] = await Promise.all([
    prisma.artwork.findMany({
      where: { artist_id: user.id, status: "approved" },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        title: true,
        artwork_media: { where: { is_primary: true }, take: 1, select: { url: true } },
      },
    }).catch(() => []),
    prisma.featuredSubmission.findMany({ where: { artist_id: user.id } }).catch(() => []),
  ])

  const subByArtwork = new Map(submissions.map((s) => [s.artwork_id, s]))

  return (
    <div className="container-page py-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Studio</p>
        <h1 className="font-display text-4xl">Featured collection</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Submit your best approved works for the curated Featured collection. The team scores each
          submission on quality, engagement, sales, freshness, diversity and curator fit.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" /> Your approved artworks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {artworks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No approved artworks yet. Publish and get approved to submit for featuring.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {artworks.map((a) => {
                const sub = subByArtwork.get(a.id)
                return (
                  <li key={a.id} className="flex items-center gap-3 py-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-md">
                      <SmartImage
                        src={a.artwork_media[0]?.url ?? null}
                        alt={a.title}
                        kind="artwork"
                        seed={a.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{a.title}</p>
                      {sub?.status === "featured" && sub.feature_score != null ? (
                        <p className="text-xs text-muted-foreground">
                          Feature score: {sub.feature_score.toFixed(1)}
                        </p>
                      ) : sub?.status === "rejected" && sub.admin_notes ? (
                        <p className="text-xs text-muted-foreground">{sub.admin_notes}</p>
                      ) : null}
                    </div>
                    <SubmitFeaturedButton artworkId={a.id} status={sub?.status ?? null} />
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
