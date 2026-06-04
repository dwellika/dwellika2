import { requireRole } from "@/lib/auth/rbac"

import { EventForm } from "../EventForm"

export const metadata = { title: "Admin · New event" }

export default async function NewEventPage() {
  await requireRole("admin", "super_admin")
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-display text-3xl">New event</h1>
      <EventForm
        defaults={{
          kind: "exhibition",
          title: "",
          description: "",
          cover_url: "",
          location: "",
          starts_at: "",
          ends_at: "",
          url: "",
          is_published: false,
          is_featured: false,
        }}
      />
    </div>
  )
}
