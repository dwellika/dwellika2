import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { ProfileRow } from "./types"

export type CourseLevel = "beginner" | "intermediate" | "advanced"

export interface CourseRow {
  id: string
  instructor_id: string
  slug: string
  title: string
  description: string | null
  cover_url: string | null
  level: CourseLevel
  price: number
  currency: string
  is_free: boolean
  duration_min: number | null
  status: string
  rating_avg: number | null
  rating_count: number
  enrollment_count: number
  created_at: string
  instructor?: Pick<ProfileRow, "id" | "username" | "full_name" | "avatar_url"> | null
}

export interface LessonRow {
  id: string
  course_id: string
  position: number
  title: string
  description: string | null
  video_url: string | null
  duration_sec: number | null
  is_preview: boolean
}

export interface WorkshopRow {
  id: string
  host_id: string
  slug: string
  title: string
  description: string | null
  cover_url: string | null
  starts_at: string
  ends_at: string
  is_live: boolean
  meeting_url: string | null
  recording_url: string | null
  price: number
  currency: string
  capacity: number | null
  status: string
  created_at: string
  host?: Pick<ProfileRow, "id" | "username" | "full_name" | "avatar_url"> | null
}

export async function listCourses({
  q,
  level,
  isFree,
  limit = 30,
}: {
  q?: string
  level?: CourseLevel
  isFree?: boolean
  limit?: number
} = {}) {
  const supabase = await createClient()
  let query = supabase
    .from("courses")
    .select(
      `id, instructor_id, slug, title, description, cover_url, level, price, currency, is_free, duration_min, status, rating_avg, rating_count, enrollment_count, created_at,
       instructor:profiles!courses_instructor_id_fkey ( id, username, full_name, avatar_url )`,
    )
    .eq("status", "approved")
    .order("enrollment_count", { ascending: false })
    .limit(limit)

  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
  if (level) query = query.eq("level", level)
  if (typeof isFree === "boolean") query = query.eq("is_free", isFree)

  const { data } = await query
  return (data ?? []) as unknown as CourseRow[]
}

export async function getCourseBySlug(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("courses")
    .select(
      `id, instructor_id, slug, title, description, cover_url, level, price, currency, is_free, duration_min, status, rating_avg, rating_count, enrollment_count, created_at,
       instructor:profiles!courses_instructor_id_fkey ( id, username, full_name, avatar_url )`,
    )
    .eq("slug", slug)
    .maybeSingle()
  return data as unknown as CourseRow | null
}

export async function listLessons(courseId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("course_lessons")
    .select("id, course_id, position, title, description, video_url, duration_sec, is_preview")
    .eq("course_id", courseId)
    .order("position", { ascending: true })
  return (data ?? []) as unknown as LessonRow[]
}

export async function getEnrollment(courseId: string, userId: string | undefined) {
  if (!userId) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from("course_enrollments")
    .select("id, course_id, user_id, progress, completed_at, enrolled_at")
    .eq("course_id", courseId)
    .eq("user_id", userId)
    .maybeSingle()
  return data as
    | {
        id: string
        course_id: string
        user_id: string
        progress: number
        completed_at: string | null
        enrolled_at: string
      }
    | null
}

export async function listMyLessonProgress(courseId: string, userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed, completed_at, watched_sec")
    .eq("user_id", userId)
    .eq("course_id", courseId)
  return new Map(
    ((data ?? []) as Array<{
      lesson_id: string
      completed: boolean
      completed_at: string | null
      watched_sec: number
    }>).map((r) => [r.lesson_id, r]),
  )
}

export async function listWorkshops({
  q,
  upcomingOnly = true,
  limit = 30,
}: { q?: string; upcomingOnly?: boolean; limit?: number } = {}) {
  const supabase = await createClient()
  let query = supabase
    .from("workshops")
    .select(
      `id, host_id, slug, title, description, cover_url, starts_at, ends_at, is_live, meeting_url, recording_url, price, currency, capacity, status, created_at,
       host:profiles!workshops_host_id_fkey ( id, username, full_name, avatar_url )`,
    )
    .eq("status", "approved")
    .order("starts_at", { ascending: true })
    .limit(limit)
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
  if (upcomingOnly) query = query.gte("ends_at", new Date().toISOString())
  const { data } = await query
  return (data ?? []) as unknown as WorkshopRow[]
}

export async function getWorkshopBySlug(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("workshops")
    .select(
      `id, host_id, slug, title, description, cover_url, starts_at, ends_at, is_live, meeting_url, recording_url, price, currency, capacity, status, created_at,
       host:profiles!workshops_host_id_fkey ( id, username, full_name, avatar_url )`,
    )
    .eq("slug", slug)
    .maybeSingle()
  return data as unknown as WorkshopRow | null
}

export async function isWorkshopRegistered(workshopId: string, userId: string | undefined) {
  if (!userId) return false
  const supabase = await createClient()
  const { count } = await supabase
    .from("workshop_registrations")
    .select("*", { count: "exact", head: true })
    .eq("workshop_id", workshopId)
    .eq("user_id", userId)
  return (count ?? 0) > 0
}

export async function getCertificate(courseId: string, userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("course_certificates")
    .select("id, certificate_no, issued_at")
    .eq("course_id", courseId)
    .eq("user_id", userId)
    .maybeSingle()
  return data as { id: string; certificate_no: string; issued_at: string } | null
}
