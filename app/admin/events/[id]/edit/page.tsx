import { notFound } from "next/navigation"

import { requireRole } from "@/lib/auth/rbac"
import { prisma } from "@/lib/prisma"

import { EventForm } from "../../EventForm"

export const metadata = { title: "Admin · Edit event" }

function toLocalInput(d: Date | null): string {
  return d ? new Date(d).toISOString().slice(0, 16) : ""
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: PageProps) {
  await requireRole("admin", "super_admin")
  const { id } = await params

  const e = await prisma.event.findUnique({ where: { id } })
  if (!e) notFound()

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-display text-3xl">Edit event</h1>
      <EventForm
        defaults={{
          id: e.id,
          kind: e.kind,
          title: e.title,
          description: e.description ?? "",
          cover_url: e.cover_url ?? "",
          location: e.location ?? "",
          starts_at: toLocalInput(e.starts_at),
          ends_at: toLocalInput(e.ends_at),
          url: e.url ?? "",
          is_published: e.is_published,
          is_featured: e.is_featured,
        }}
      />
    </div>
  )
}
