import { requireRole } from "@/lib/auth/rbac"

import { WorkshopForm } from "../WorkshopForm"

export const metadata = { title: "New workshop · Dwellika" }

export default async function NewWorkshopPage() {
  await requireRole("artist", "admin", "super_admin")

  return (
    <div className="container-page max-w-3xl py-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Studio</p>
        <h1 className="font-display text-4xl">New workshop</h1>
      </header>
      <WorkshopForm
        defaults={{
          title: "",
          description: "",
          cover_url: "",
          starts_at: "",
          ends_at: "",
          is_live: true,
          meeting_url: "",
          recording_url: "",
          price: "0",
          currency: "INR",
          capacity: "",
        }}
      />
    </div>
  )
}
