import { requireRole } from "@/lib/auth/rbac"

import { NewArtworkForm } from "./NewArtworkForm"

export const metadata = { title: "Upload artwork" }

export default async function NewArtworkPage() {
  await requireRole("artist", "admin", "super_admin")
  return (
    <div className="container-page py-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Studio</p>
        <h1 className="font-display text-4xl">Upload a new artwork</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Tell collectors what makes this piece sing. Submitted works are
          reviewed by our moderators before appearing on the gallery.
        </p>
      </header>

      <NewArtworkForm />
    </div>
  )
}
