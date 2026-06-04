import { requireRole } from "@/lib/auth/rbac"

import { CourseForm } from "../CourseForm"

export const metadata = { title: "New course · Dwellika" }

export default async function NewCoursePage() {
  await requireRole("artist", "admin", "super_admin")

  return (
    <div className="container-page max-w-3xl py-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Studio</p>
        <h1 className="font-display text-4xl">New course</h1>
        <p className="mt-1 text-muted-foreground">Save the basics first, then add lessons.</p>
      </header>
      <CourseForm
        defaults={{
          title: "",
          description: "",
          cover_url: "",
          level: "beginner",
          is_free: false,
          price: "0",
          currency: "INR",
          duration_min: "",
        }}
      />
    </div>
  )
}
