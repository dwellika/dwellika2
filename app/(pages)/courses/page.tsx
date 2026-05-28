import Link from "next/link"
import { Search, Sparkles, Users } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SmartImage } from "@/components/ui/smart-image"
import { listCourses, type CourseLevel } from "@/lib/data/learning"

export const metadata = {
  title: "Courses",
  description: "Self-paced lessons taught by the artists shaping Dwellika.",
}

const LEVELS: CourseLevel[] = ["beginner", "intermediate", "advanced"]

interface PageProps {
  searchParams: Promise<{ q?: string; level?: CourseLevel; free?: string }>
}

export const revalidate = 60

export default async function CoursesPage({ searchParams }: PageProps) {
  const { q, level, free } = await searchParams
  const courses = await listCourses({
    q,
    level,
    isFree: free === "1" ? true : undefined,
    limit: 60,
  })

  return (
    <div className="container-page py-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Learn</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Courses</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Self-paced lessons taught by the artists shaping Dwellika. Free and
          paid courses across every medium.
        </p>
      </header>

      <form className="mb-8 space-y-3">
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q ?? ""} placeholder="Search courses…" className="pl-9" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Pill href="/courses" label="All" active={!level && !free} />
          {LEVELS.map((l) => (
            <Pill
              key={l}
              href={`/courses?level=${l}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              label={l}
              active={level === l}
            />
          ))}
          <Pill
            href={`/courses?free=1${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            label="Free"
            active={free === "1"}
          />
        </div>
      </form>

      {courses.length === 0 ? (
        <Empty />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Link key={c.id} href={`/courses/${c.slug}`}>
              <Card className="group h-full overflow-hidden transition-all hover:border-primary/40">
                <div className="relative aspect-video w-full overflow-hidden">
                  <SmartImage
                    src={c.cover_url}
                    alt={c.title}
                    kind="course"
                    seed={c.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="image-overlay absolute inset-0" />
                  <div className="absolute left-3 top-3 flex gap-2">
                    {c.is_free ? <Badge variant="default">Free</Badge> : null}
                    <Badge variant="outline" className="capitalize">{c.level}</Badge>
                  </div>
                </div>
                <CardContent className="space-y-3 p-4">
                  <h3 className="line-clamp-2 font-display text-lg">{c.title}</h3>
                  {c.instructor ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Avatar className="size-5">
                        <AvatarImage src={c.instructor.avatar_url ?? undefined} />
                        <AvatarFallback>
                          {(c.instructor.full_name ?? "?").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      by {c.instructor.full_name ?? `@${c.instructor.username}`}
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between border-t border-border pt-2">
                    <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="size-3.5" /> {c.enrollment_count.toLocaleString()} enrolled
                    </p>
                    <p className="font-display text-base">
                      {c.is_free
                        ? "Free"
                        : `${c.currency} ${Number(c.price).toLocaleString()}`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function Pill({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={
        active
          ? "shrink-0 rounded-full border border-primary bg-primary/15 px-3 py-1 text-xs font-medium capitalize text-primary"
          : "shrink-0 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs capitalize text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
      }
    >
      {label}
    </Link>
  )
}

function Empty() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-12 text-center">
      <Sparkles className="mx-auto size-8 text-muted-foreground" />
      <p className="mt-3 font-display text-2xl">No courses yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Instructors are uploading — check back soon.
      </p>
    </div>
  )
}
