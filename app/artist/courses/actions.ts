"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import type { CourseLevel } from "@/lib/data/learning"

type ActionResult = { ok: true } | { ok: false; error: string }

const LEVELS = ["beginner", "intermediate", "advanced"] as const

function slugify(s: string) {
  return s.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 56)
}

async function requireArtist(): Promise<string | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  if (!["artist", "admin", "super_admin"].includes(session.user.role ?? "")) return null
  return session.user.id
}

function parseFields(fd: FormData) {
  const title = String(fd.get("title") ?? "").trim()
  if (!title) return { error: "Title is required." as const }

  const levelRaw = String(fd.get("level") ?? "beginner")
  const level = (LEVELS.includes(levelRaw as CourseLevel) ? levelRaw : "beginner") as CourseLevel
  const isFree = fd.get("is_free") === "on"
  const priceNum = Number(fd.get("price") ?? 0)
  const durRaw = String(fd.get("duration_min") ?? "").trim()

  return {
    title,
    description: String(fd.get("description") ?? "").trim() || null,
    cover_url: String(fd.get("cover_url") ?? "").trim() || null,
    level,
    is_free: isFree,
    price: isFree ? 0 : Number.isFinite(priceNum) && priceNum > 0 ? priceNum : 0,
    currency: String(fd.get("currency") ?? "INR").trim() || "INR",
    duration_min: durRaw ? Math.max(0, parseInt(durRaw, 10) || 0) || null : null,
  }
}

export async function createCourse(fd: FormData): Promise<ActionResult | void> {
  const userId = await requireArtist()
  if (!userId) return { ok: false, error: "Only artists can create courses." }

  const parsed = parseFields(fd)
  if ("error" in parsed) return { ok: false, error: parsed.error }

  const submit = fd.get("submit_for_review") === "on"

  let slug = slugify(parsed.title)
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.course.findUnique({ where: { slug }, select: { id: true } })
    if (!exists) break
    slug = `${slugify(parsed.title)}-${Math.floor(Math.random() * 9999)}`
  }

  const course = await prisma.course.create({
    data: { instructor_id: userId, slug, ...parsed, status: submit ? "pending" : "draft" },
    select: { id: true },
  })

  revalidatePath("/artist/courses")
  redirect(`/artist/courses/${course.id}/edit`)
}

export async function updateCourse(id: string, fd: FormData): Promise<ActionResult | void> {
  const userId = await requireArtist()
  if (!userId) return { ok: false, error: "Not authorized." }

  const parsed = parseFields(fd)
  if ("error" in parsed) return { ok: false, error: parsed.error }

  const submit = fd.get("submit_for_review") === "on"

  const result = await prisma.course.updateMany({
    where: { id, instructor_id: userId },
    data: { ...parsed, status: submit ? "pending" : "draft" },
  })
  if (result.count === 0) return { ok: false, error: "Course not found." }

  revalidatePath("/artist/courses")
  revalidatePath(`/artist/courses/${id}/edit`)
  return { ok: true }
}

export async function deleteCourse(id: string): Promise<ActionResult> {
  const userId = await requireArtist()
  if (!userId) return { ok: false, error: "Not authorized." }

  const result = await prisma.course.deleteMany({ where: { id, instructor_id: userId } })
  if (result.count === 0) return { ok: false, error: "Course not found." }

  revalidatePath("/artist/courses")
  return { ok: true }
}

// ─── Lessons ──────────────────────────────────────────────────────────────────

async function ownsCourse(courseId: string, userId: string) {
  const c = await prisma.course.findFirst({ where: { id: courseId, instructor_id: userId }, select: { id: true } })
  return Boolean(c)
}

export async function addLesson(courseId: string, fd: FormData): Promise<ActionResult> {
  const userId = await requireArtist()
  if (!userId) return { ok: false, error: "Not authorized." }
  if (!(await ownsCourse(courseId, userId))) return { ok: false, error: "Course not found." }

  const title = String(fd.get("title") ?? "").trim()
  if (!title) return { ok: false, error: "Lesson title is required." }

  const last = await prisma.courseLesson.findFirst({
    where: { course_id: courseId },
    orderBy: { position: "desc" },
    select: { position: true },
  })
  const position = (last?.position ?? 0) + 1

  const durRaw = String(fd.get("duration_sec") ?? "").trim()

  await prisma.courseLesson.create({
    data: {
      course_id: courseId,
      position,
      title,
      description: String(fd.get("description") ?? "").trim() || null,
      video_url: String(fd.get("video_url") ?? "").trim() || null,
      duration_sec: durRaw ? Math.max(0, parseInt(durRaw, 10) || 0) || null : null,
      is_preview: fd.get("is_preview") === "on",
    },
  })

  revalidatePath(`/artist/courses/${courseId}/edit`)
  return { ok: true }
}

export async function deleteLesson(courseId: string, lessonId: string): Promise<ActionResult> {
  const userId = await requireArtist()
  if (!userId) return { ok: false, error: "Not authorized." }
  if (!(await ownsCourse(courseId, userId))) return { ok: false, error: "Course not found." }

  await prisma.courseLesson.deleteMany({ where: { id: lessonId, course_id: courseId } })
  revalidatePath(`/artist/courses/${courseId}/edit`)
  return { ok: true }
}
