import { requireRole } from "@/lib/auth/rbac"
import { listArtworks } from "@/lib/data/artworks"

import { NewReelForm } from "./NewReelForm"

export const metadata = { title: "New reel · Dwellika" }

export default async function NewReelPage() {
  const user = await requireRole("artist", "admin", "super_admin")

  // Offer the artist's own artworks to optionally link to the reel
  const { artworks } = await listArtworks({ artistId: user.id, status: "all", limit: 50 })
    .catch(() => ({ artworks: [] as Awaited<ReturnType<typeof listArtworks>>["artworks"] }))

  return (
    <div className="container-page max-w-3xl py-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Studio</p>
        <h1 className="font-display text-4xl">New reel</h1>
        <p className="mt-1 text-muted-foreground">
          Share a process clip or timelapse. Reels are reviewed before appearing in the public feed.
        </p>
      </header>

      <NewReelForm artworks={artworks.map((a) => ({ id: a.id, title: a.title }))} />
    </div>
  )
}
