import { requireRole } from "@/lib/auth/rbac"
import { prisma } from "@/lib/prisma"

import { NewArtworkForm } from "./NewArtworkForm"

export const metadata = { title: "Upload artwork" }

export default async function NewArtworkPage() {
  const user = await requireRole("artist", "admin", "super_admin")

  // Fetch existing unlinked reels for attachment
  const reels = await prisma.reel.findMany({
    where: { creator_id: user.id, artwork_id: null, status: "approved" },
    select: { id: true, caption: true, thumbnail_url: true },
    orderBy: { created_at: "desc" },
    take: 20,
  })

  return (
    <div className="container-page pb-16 pt-16 sm:pt-20">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Studio</p>
        <h1 className="font-display text-4xl">Upload a new artwork</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Tell collectors what makes this piece sing. Submitted works are
          reviewed by our moderators before appearing on the gallery.
        </p>
      </header>

      <NewArtworkForm reels={reels} />
    </div>
  )
}
