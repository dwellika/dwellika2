import "server-only"

import { prisma } from "@/lib/prisma"

export type CourseLevel = "beginner" | "intermediate" | "advanced"

export async function listCourses({ q, level, isFree, limit = 30 }: { q?: string; level?: CourseLevel; isFree?: boolean; limit?: number } = {}) {
  return prisma.course.findMany({
    where: {
      status: "approved",
      ...(level ? { level } : {}),
      ...(typeof isFree === "boolean" ? { is_free: isFree } : {}),
      ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] } : {}),
    },
    include: {
      instructor: { select: { id: true, username: true, full_name: true, avatar_url: true } },
    },
    orderBy: { enrollment_count: "desc" },
    take: limit,
  })
}

export async function getCourseBySlug(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    include: {
      instructor: { select: { id: true, username: true, full_name: true, avatar_url: true } },
    },
  })
}

export async function listLessons(courseId: string) {
  return prisma.courseLesson.findMany({
    where: { course_id: courseId },
    orderBy: { position: "asc" },
  })
}

export async function getEnrollment(courseId: string, userId: string | undefined) {
  if (!userId) return null
  return prisma.courseEnrollment.findUnique({
    where: { course_id_user_id: { course_id: courseId, user_id: userId } },
  })
}

export async function listMyLessonProgress(courseId: string, userId: string) {
  const progress = await prisma.lessonProgress.findMany({
    where: { user_id: userId, course_id: courseId },
  })
  return new Map(progress.map((p) => [p.lesson_id, p]))
}

export async function listWorkshops({ q, upcomingOnly = true, limit = 30 }: { q?: string; upcomingOnly?: boolean; limit?: number } = {}) {
  return prisma.workshop.findMany({
    where: {
      status: "approved",
      ...(upcomingOnly ? { ends_at: { gte: new Date() } } : {}),
      ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] } : {}),
    },
    include: {
      host: { select: { id: true, username: true, full_name: true, avatar_url: true } },
    },
    orderBy: { starts_at: "asc" },
    take: limit,
  })
}

export async function getWorkshopBySlug(slug: string) {
  return prisma.workshop.findUnique({
    where: { slug },
    include: {
      host: { select: { id: true, username: true, full_name: true, avatar_url: true } },
    },
  })
}

export async function isWorkshopRegistered(workshopId: string, userId: string | undefined) {
  if (!userId) return false
  const count = await prisma.workshopRegistration.count({
    where: { workshop_id: workshopId, user_id: userId },
  })
  return count > 0
}

export async function getCertificate(courseId: string, userId: string) {
  return prisma.courseCertificate.findUnique({
    where: { course_id_user_id: { course_id: courseId, user_id: userId } },
    select: { id: true, certificate_no: true, issued_at: true },
  })
}
