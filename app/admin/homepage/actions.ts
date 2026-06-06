"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import type { AnnouncementCategory, TestimonialGroup } from "@/lib/types/database"

import { computeArtistScore } from "./score"

type ActionResult = { ok: true } | { ok: false; error: string }

async function requireAdmin(): Promise<string | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  const role = session.user.role as string | undefined
  if (role !== "admin" && role !== "super_admin") return null
  return session.user.id
}

function revalidateHome() {
  revalidatePath("/admin/homepage")
  revalidatePath("/")
}

// ─── Announcements ──────────────────────────────────────────────────────────

const ANNOUNCEMENT_CATEGORIES = ["event", "workshop", "course", "notification"]

export async function createAnnouncement(fd: FormData): Promise<ActionResult> {
  const adminId = await requireAdmin()
  if (!adminId) return { ok: false, error: "Admins only." }

  const title = String(fd.get("title") ?? "").trim()
  if (!title) return { ok: false, error: "Title is required." }
  const catRaw = String(fd.get("category") ?? "notification")
  const category = (ANNOUNCEMENT_CATEGORIES.includes(catRaw) ? catRaw : "notification") as AnnouncementCategory

  await prisma.announcement.create({
    data: {
      category,
      title,
      body: String(fd.get("body") ?? "").trim() || null,
      cta_label: String(fd.get("cta_label") ?? "").trim() || null,
      cta_url: String(fd.get("cta_url") ?? "").trim() || null,
      image_url: String(fd.get("image_url") ?? "").trim() || null,
      is_pinned: fd.get("is_pinned") === "on",
    },
  })
  revalidateHome()
  return { ok: true }
}

export async function toggleAnnouncementPin(id: string, pinned: boolean): Promise<ActionResult> {
  const adminId = await requireAdmin()
  if (!adminId) return { ok: false, error: "Admins only." }
  await prisma.announcement.update({ where: { id }, data: { is_pinned: pinned } })
  revalidateHome()
  return { ok: true }
}

export async function deleteAnnouncement(id: string): Promise<ActionResult> {
  const adminId = await requireAdmin()
  if (!adminId) return { ok: false, error: "Admins only." }
  await prisma.announcement.delete({ where: { id } }).catch(() => {})
  revalidateHome()
  return { ok: true }
}

// ─── Testimonials ("People who make Dwellika") ────────────────────────────────

const TESTIMONIAL_GROUPS = ["artist", "seller", "buyer"]

export async function createTestimonial(fd: FormData): Promise<ActionResult> {
  const adminId = await requireAdmin()
  if (!adminId) return { ok: false, error: "Admins only." }

  const author_name = String(fd.get("author_name") ?? "").trim()
  const body = String(fd.get("body") ?? "").trim()
  if (!author_name || !body) return { ok: false, error: "Author and quote are required." }

  const groupRaw = String(fd.get("group_name") ?? "buyer")
  const group_name = (TESTIMONIAL_GROUPS.includes(groupRaw) ? groupRaw : "buyer") as TestimonialGroup
  const ratingRaw = String(fd.get("rating") ?? "").trim()

  await prisma.testimonial.create({
    data: {
      group_name,
      author_name,
      role_label: String(fd.get("role_label") ?? "").trim() || null,
      avatar_url: String(fd.get("avatar_url") ?? "").trim() || null,
      body,
      rating: ratingRaw ? Math.min(5, Math.max(1, parseInt(ratingRaw, 10) || 0)) || null : null,
      is_featured: fd.get("is_featured") === "on",
    },
  })
  revalidateHome()
  return { ok: true }
}

export async function toggleTestimonialFeatured(id: string, featured: boolean): Promise<ActionResult> {
  const adminId = await requireAdmin()
  if (!adminId) return { ok: false, error: "Admins only." }
  await prisma.testimonial.update({ where: { id }, data: { is_featured: featured } })
  revalidateHome()
  return { ok: true }
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  const adminId = await requireAdmin()
  if (!adminId) return { ok: false, error: "Admins only." }
  await prisma.testimonial.delete({ where: { id } }).catch(() => {})
  revalidateHome()
  return { ok: true }
}

// ─── Artist of the Week (Artist Score) ────────────────────────────────────────

const clamp = (n: number) => Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0))

export async function setArtistOfWeek(
  username: string,
  raw: { portfolio: number; engagement: number; collection: number; freshness: number; storytelling: number; diversity: number },
): Promise<ActionResult> {
  const adminId = await requireAdmin()
  if (!adminId) return { ok: false, error: "Admins only." }

  const user = await prisma.user.findUnique({
    where: { username: username.trim().toLowerCase() },
    select: { id: true, role: true },
  })
  if (!user) return { ok: false, error: "No user with that username." }

  const scores = {
    portfolio: clamp(raw.portfolio),
    engagement: clamp(raw.engagement),
    collection: clamp(raw.collection),
    freshness: clamp(raw.freshness),
    storytelling: clamp(raw.storytelling),
    diversity: clamp(raw.diversity),
  }
  const score = computeArtistScore(scores)

  // Only one active artist of the week at a time.
  await prisma.homepageFeature.updateMany({
    where: { section: "artist_of_week", is_active: true },
    data: { is_active: false },
  })
  await prisma.homepageFeature.create({
    data: {
      section: "artist_of_week",
      entity_type: "user",
      entity_id: user.id,
      is_active: true,
      score,
      meta: scores,
      created_by: adminId,
    },
  })

  revalidateHome()
  return { ok: true }
}

export async function clearArtistOfWeek(): Promise<ActionResult> {
  const adminId = await requireAdmin()
  if (!adminId) return { ok: false, error: "Admins only." }
  await prisma.homepageFeature.updateMany({
    where: { section: "artist_of_week", is_active: true },
    data: { is_active: false },
  })
  revalidateHome()
  return { ok: true }
}

// ─── Curated lists: trending_artists / best_studio ────────────────────────────

export async function promoteToSection(section: string, username: string): Promise<ActionResult> {
  const adminId = await requireAdmin()
  if (!adminId) return { ok: false, error: "Admins only." }
  if (!["trending_artists", "best_studio"].includes(section)) {
    return { ok: false, error: "Invalid section." }
  }

  const user = await prisma.user.findUnique({
    where: { username: username.trim().toLowerCase() },
    select: { id: true },
  })
  if (!user) return { ok: false, error: "No user with that username." }

  const existing = await prisma.homepageFeature.findFirst({
    where: { section, entity_id: user.id, is_active: true },
    select: { id: true },
  })
  if (existing) return { ok: false, error: "Already promoted." }

  const last = await prisma.homepageFeature.findFirst({
    where: { section, is_active: true },
    orderBy: { position: "desc" },
    select: { position: true },
  })

  await prisma.homepageFeature.create({
    data: {
      section,
      entity_type: section === "best_studio" ? "studio" : "user",
      entity_id: user.id,
      position: (last?.position ?? 0) + 1,
      is_active: true,
      created_by: adminId,
    },
  })
  revalidateHome()
  return { ok: true }
}

export async function removeFeature(id: string): Promise<ActionResult> {
  const adminId = await requireAdmin()
  if (!adminId) return { ok: false, error: "Admins only." }
  await prisma.homepageFeature.delete({ where: { id } }).catch(() => {})
  revalidateHome()
  return { ok: true }
}
