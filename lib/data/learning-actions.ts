"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

type ActionResult = { ok: true } | { ok: false; error: string }

export async function enrollInCourse(courseId: string): Promise<ActionResult | void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Sign in to enroll." }

  // Check existing enrollment
  const { count } = await supabase
    .from("course_enrollments")
    .select("*", { count: "exact", head: true })
    .eq("course_id", courseId)
    .eq("user_id", user.id)

  if ((count ?? 0) === 0) {
    const { error } = await supabase
      .from("course_enrollments")
      .insert({ course_id: courseId, user_id: user.id })
    if (error) return { ok: false, error: error.message }
  }

  revalidatePath("/courses")
  return { ok: true }
}

export async function markLessonComplete(
  lessonId: string,
  courseId: string,
  watchedSec: number,
): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: "Sign in." }

    const { error } = await supabase
      .from("lesson_progress")
      .upsert(
        {
          user_id: user.id,
          lesson_id: lessonId,
          course_id: courseId,
          completed: true,
          completed_at: new Date().toISOString(),
          watched_sec: Math.max(0, Math.floor(watchedSec)),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id" },
      )
    if (error) return { ok: false, error: error.message }
    revalidatePath("/courses")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function registerWorkshop(workshopId: string): Promise<ActionResult | void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Sign in to register." }

  const { error } = await supabase
    .from("workshop_registrations")
    .upsert(
      { workshop_id: workshopId, user_id: user.id },
      { onConflict: "workshop_id,user_id" },
    )
  if (error) return { ok: false, error: error.message }
  revalidatePath("/workshops")
  return { ok: true }
}
