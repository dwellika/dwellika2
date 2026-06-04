import Link from "next/link"
import { Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { requireRole } from "@/lib/auth/rbac"
import { prisma } from "@/lib/prisma"

import { CourseRowActions } from "./RowActions"

export const metadata = { title: "My courses · Dwellika" }
export const dynamic = "force-dynamic"

const STATUS_TONE: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-amber-500/20 text-amber-300",
  approved: "bg-emerald-500/20 text-emerald-300",
  rejected: "bg-red-500/20 text-red-300",
  hidden: "bg-muted text-muted-foreground",
}

export default async function ArtistCoursesPage() {
  const user = await requireRole("artist", "admin", "super_admin")

  const courses = await prisma.course
    .findMany({
      where: { instructor_id: user.id },
      orderBy: { created_at: "desc" },
      include: { _count: { select: { lessons: true, enrollments: true } } },
    })
    .catch(() => [])

  return (
    <div className="container-page py-12">
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Studio</p>
          <h1 className="font-display text-4xl">My courses</h1>
          <p className="mt-1 text-muted-foreground">Create self-paced video courses with lessons.</p>
        </div>
        <Button asChild>
          <Link href="/artist/courses/new"><Plus className="size-4" /> New course</Link>
        </Button>
      </header>

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-16 text-center">
          <p className="font-display text-2xl">No courses yet</p>
          <p className="mt-2 text-muted-foreground">Create your first course to start teaching.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{c.title}</p>
                    <Badge className={STATUS_TONE[c.status] ?? ""}>{c.status}</Badge>
                    <Badge variant="outline" className="capitalize">{c.level}</Badge>
                    {c.is_free ? <Badge variant="outline">Free</Badge> : null}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c._count.lessons} lesson{c._count.lessons === 1 ? "" : "s"} · {c._count.enrollments} enrolled
                  </p>
                </div>
                <CourseRowActions id={c.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
