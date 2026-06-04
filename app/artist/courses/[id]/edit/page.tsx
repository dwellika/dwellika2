import { notFound } from "next/navigation"

import { requireRole } from "@/lib/auth/rbac"
import { prisma } from "@/lib/prisma"

import { CourseForm } from "../../CourseForm"
import { LessonsManager } from "../../LessonsManager"

export const metadata = { title: "Edit course · Dwellika" }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditCoursePage({ params }: PageProps) {
  const user = await requireRole("artist", "admin", "super_admin")
  const { id } = await params

  const course = await prisma.course.findFirst({
    where: { id, instructor_id: user.id },
    include: { lessons: { orderBy: { position: "asc" } } },
  })
  if (!course) notFound()

  return (
    <div className="container-page max-w-3xl space-y-8 py-12">
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Studio</p>
        <h1 className="font-display text-4xl">Edit course</h1>
      </header>

      <CourseForm
        defaults={{
          id: course.id,
          title: course.title,
          description: course.description ?? "",
          cover_url: course.cover_url ?? "",
          level: course.level,
          is_free: course.is_free,
          price: String(Number(course.price)),
          currency: course.currency,
          duration_min: course.duration_min != null ? String(course.duration_min) : "",
        }}
      />

      <LessonsManager
        courseId={course.id}
        lessons={course.lessons.map((l) => ({
          id: l.id,
          position: l.position,
          title: l.title,
          duration_sec: l.duration_sec,
          is_preview: l.is_preview,
        }))}
      />
    </div>
  )
}
