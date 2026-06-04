import { notFound } from "next/navigation"

import { requireRole } from "@/lib/auth/rbac"
import { prisma } from "@/lib/prisma"

import { WorkshopForm } from "../../WorkshopForm"

export const metadata = { title: "Edit workshop · Dwellika" }

// Format a Date for an <input type="datetime-local"> value (YYYY-MM-DDTHH:mm).
function toLocalInput(d: Date): string {
  return new Date(d).toISOString().slice(0, 16)
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditWorkshopPage({ params }: PageProps) {
  const user = await requireRole("artist", "admin", "super_admin")
  const { id } = await params

  const w = await prisma.workshop.findFirst({ where: { id, host_id: user.id } })
  if (!w) notFound()

  return (
    <div className="container-page max-w-3xl py-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Studio</p>
        <h1 className="font-display text-4xl">Edit workshop</h1>
      </header>
      <WorkshopForm
        defaults={{
          id: w.id,
          title: w.title,
          description: w.description ?? "",
          cover_url: w.cover_url ?? "",
          starts_at: toLocalInput(w.starts_at),
          ends_at: toLocalInput(w.ends_at),
          is_live: w.is_live,
          meeting_url: w.meeting_url ?? "",
          recording_url: w.recording_url ?? "",
          price: String(Number(w.price)),
          currency: w.currency,
          capacity: w.capacity != null ? String(w.capacity) : "",
        }}
      />
    </div>
  )
}
