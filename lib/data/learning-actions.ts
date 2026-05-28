"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

type ActionResult = { ok: true } | { ok: false; error: string }

export async function enrollInCourse(courseId: string): Promise<ActionResult | void> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Sign in to enroll." }
  const userId = session.user.id

  await prisma.courseEnrollment.upsert({
    where: { course_id_user_id: { course_id: courseId, user_id: userId } },
    create: { course_id: courseId, user_id: userId },
    update: {},
  })

  revalidatePath("/courses")
  return { ok: true }
}

export async function markLessonComplete(
  lessonId: string,
  courseId: string,
  watchedSec: number,
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { ok: false, error: "Sign in." }

    await prisma.lessonProgress.upsert({
      where: { user_id_lesson_id: { user_id: session.user.id, lesson_id: lessonId } },
      create: {
        user_id: session.user.id,
        lesson_id: lessonId,
        course_id: courseId,
        completed: true,
        completed_at: new Date(),
        watched_sec: Math.max(0, Math.floor(watchedSec)),
      },
      update: {
        completed: true,
        completed_at: new Date(),
        watched_sec: Math.max(0, Math.floor(watchedSec)),
      },
    })

    revalidatePath("/courses")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function registerWorkshop(workshopId: string): Promise<ActionResult | void> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Sign in to register." }

  await prisma.workshopRegistration.upsert({
    where: { workshop_id_user_id: { workshop_id: workshopId, user_id: session.user.id } },
    create: { workshop_id: workshopId, user_id: session.user.id },
    update: {},
  })

  revalidatePath("/workshops")
  return { ok: true }
}
