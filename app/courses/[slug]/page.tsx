import { notFound } from "next/navigation"
import Link from "next/link"
import { Award, Clock, PlayCircle, Sparkles, Users } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SmartImage } from "@/components/ui/smart-image"
import { courseJsonLd, JsonLd } from "@/components/seo/JsonLd"
import { getCurrentUser } from "@/lib/auth/rbac"
import {
  getCertificate,
  getCourseBySlug,
  getEnrollment,
  listLessons,
  listMyLessonProgress,
} from "@/lib/data/learning"

import { EnrollButton } from "./EnrollButton"
import { LessonRow } from "./LessonRow"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const c = await getCourseBySlug(slug).catch(() => null)
  if (!c) return { title: "Course" }

  const instructorName = c.instructor.full_name ?? `@${c.instructor.username}`
  const description =
    c.description ?? `Online art course by ${instructorName} on Dwellika.`

  return {
    title: c.title,
    description,
    keywords: [c.title, instructorName, "online art course", "learn art", "Dwellika"],
    alternates: { canonical: `/courses/${c.slug}` },
    openGraph: {
      type: "website" as const,
      url: `/courses/${c.slug}`,
      title: c.title,
      description,
      images: c.cover_url ? [{ url: c.cover_url, alt: c.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image" as const,
      title: c.title,
      description,
      images: c.cover_url ? [c.cover_url] : undefined,
    },
  }
}

export default async function CoursePage({ params }: PageProps) {
  const { slug } = await params
  const course = await getCourseBySlug(slug)
  if (!course) notFound()

  const viewer = await getCurrentUser()
  const [lessons, enrollment, progressMap, certificate] = await Promise.all([
    listLessons(course.id),
    getEnrollment(course.id, viewer?.id),
    viewer ? listMyLessonProgress(course.id, viewer.id) : Promise.resolve(new Map()),
    viewer ? getCertificate(course.id, viewer.id) : Promise.resolve(null),
  ])

  const enrolled = Boolean(enrollment)
  const completed = enrollment?.completed_at != null

  const totalSec = lessons.reduce((s, l) => s + (l.duration_sec ?? 0), 0)

  return (
    <div className="relative">
      <JsonLd
        data={courseJsonLd({
          name: course.title,
          description: course.description,
          url: `/courses/${course.slug}`,
          image: course.cover_url,
          instructorName: course.instructor
            ? (course.instructor.full_name ?? `@${course.instructor.username}`)
            : "Dwellika",
        })}
      />
      <div className="relative h-64 w-full overflow-hidden md:h-80">
        <SmartImage
          src={course.cover_url}
          alt={course.title}
          kind="course"
          seed={course.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="container-page -mt-16 pb-16">
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <header className="space-y-2">
              <div className="flex items-center gap-2">
                {course.is_free ? <Badge>Free</Badge> : null}
                <Badge variant="outline" className="capitalize">{course.level}</Badge>
              </div>
              <h1 className="font-display text-4xl md:text-5xl">{course.title}</h1>
              {course.description ? (
                <p className="text-muted-foreground">{course.description}</p>
              ) : null}
              {course.instructor ? (
                <Link
                  href={`/u/${course.instructor.username}`}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Avatar className="size-7">
                    <AvatarImage src={course.instructor.avatar_url ?? undefined} />
                    <AvatarFallback>
                      {(course.instructor.full_name ?? "?").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  by {course.instructor.full_name ?? `@${course.instructor.username}`}
                </Link>
              ) : null}
            </header>

            <Card>
              <CardHeader>
                <CardTitle>Curriculum · {lessons.length} lessons</CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border p-0">
                {lessons.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                    The instructor hasn&apos;t published any lessons yet.
                  </p>
                ) : (
                  lessons.map((l) => (
                    <LessonRow
                      key={l.id}
                      lesson={l}
                      enrolled={enrolled}
                      completed={progressMap.get(l.id)?.completed ?? false}
                      isAuthed={Boolean(viewer)}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardContent className="space-y-4 p-5">
                <p className="font-display text-3xl">
                  {course.is_free
                    ? "Free"
                    : `${course.currency} ${Number(course.price).toLocaleString()}`}
                </p>
                {certificate ? (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                    <Award className="mr-1 inline size-4" /> Certificate ready · {certificate.certificate_no}
                  </div>
                ) : null}
                <EnrollButton
                  courseId={course.id}
                  enrolled={enrolled}
                  isAuthed={Boolean(viewer)}
                  isFree={course.is_free}
                  completed={completed}
                />

                <div className="grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs">
                  <Stat
                    Icon={Users}
                    value={course.enrollment_count.toLocaleString()}
                    label="enrolled"
                  />
                  <Stat
                    Icon={Clock}
                    value={`${Math.max(1, Math.round(totalSec / 60))} min`}
                    label="total"
                  />
                  <Stat Icon={PlayCircle} value={String(lessons.length)} label="lessons" />
                  <Stat Icon={Sparkles} value={course.level} label="level" />
                </div>

                {enrolled ? (
                  <div className="border-t border-border pt-3">
                    <p className="mb-1 text-xs text-muted-foreground">Your progress</p>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent"
                        style={{ width: `${Number(enrollment?.progress ?? 0)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                      {Math.round(Number(enrollment?.progress ?? 0))}%
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}

function Stat({
  Icon,
  value,
  label,
}: {
  Icon: React.ElementType
  value: string
  label: string
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-3.5 text-muted-foreground" />
      <div>
        <p className="capitalize tabular-nums">{value}</p>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
