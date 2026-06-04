"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

type ActionResult = { ok: true } | { ok: false; error: string }

function slugify(s: string) {
  return s.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 56)
}

async function requireArtist(): Promise<string | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  if (!["artist", "admin", "super_admin"].includes(session.user.role ?? "")) return null
  return session.user.id
}

interface WorkshopFields {
  title: string
  description: string | null
  cover_url: string | null
  starts_at: Date
  ends_at: Date
  is_live: boolean
  meeting_url: string | null
  recording_url: string | null
  price: number
  currency: string
  capacity: number | null
}

function parseFields(fd: FormData): WorkshopFields | { error: string } {
  const title = String(fd.get("title") ?? "").trim()
  if (!title) return { error: "Title is required." }

  const startsRaw = String(fd.get("starts_at") ?? "")
  const endsRaw = String(fd.get("ends_at") ?? "")
  const starts_at = new Date(startsRaw)
  const ends_at = new Date(endsRaw)
  if (isNaN(starts_at.getTime()) || isNaN(ends_at.getTime())) {
    return { error: "Valid start and end date/time are required." }
  }
  if (ends_at <= starts_at) return { error: "End time must be after the start time." }

  const priceNum = Number(fd.get("price") ?? 0)
  const capRaw = String(fd.get("capacity") ?? "").trim()

  return {
    title,
    description: String(fd.get("description") ?? "").trim() || null,
    cover_url: String(fd.get("cover_url") ?? "").trim() || null,
    starts_at,
    ends_at,
    is_live: fd.get("is_live") === "on",
    meeting_url: String(fd.get("meeting_url") ?? "").trim() || null,
    recording_url: String(fd.get("recording_url") ?? "").trim() || null,
    price: Number.isFinite(priceNum) && priceNum > 0 ? priceNum : 0,
    currency: String(fd.get("currency") ?? "INR").trim() || "INR",
    capacity: capRaw ? Math.max(1, parseInt(capRaw, 10) || 0) || null : null,
  }
}

export async function createWorkshop(fd: FormData): Promise<ActionResult | void> {
  const userId = await requireArtist()
  if (!userId) return { ok: false, error: "Only artists can host workshops." }

  const parsed = parseFields(fd)
  if ("error" in parsed) return { ok: false, error: parsed.error }

  const submit = fd.get("submit_for_review") === "on"

  let slug = slugify(parsed.title)
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.workshop.findUnique({ where: { slug }, select: { id: true } })
    if (!exists) break
    slug = `${slugify(parsed.title)}-${Math.floor(Math.random() * 9999)}`
  }

  await prisma.workshop.create({
    data: { host_id: userId, slug, ...parsed, status: submit ? "pending" : "draft" },
  })

  revalidatePath("/artist/workshops")
  redirect("/artist/workshops")
}

export async function updateWorkshop(id: string, fd: FormData): Promise<ActionResult | void> {
  const userId = await requireArtist()
  if (!userId) return { ok: false, error: "Not authorized." }

  const parsed = parseFields(fd)
  if ("error" in parsed) return { ok: false, error: parsed.error }

  const submit = fd.get("submit_for_review") === "on"

  // Ownership-scoped update; editing re-enters the review queue.
  const result = await prisma.workshop.updateMany({
    where: { id, host_id: userId },
    data: { ...parsed, status: submit ? "pending" : "draft" },
  })
  if (result.count === 0) return { ok: false, error: "Workshop not found." }

  revalidatePath("/artist/workshops")
  redirect("/artist/workshops")
}

export async function deleteWorkshop(id: string): Promise<ActionResult> {
  const userId = await requireArtist()
  if (!userId) return { ok: false, error: "Not authorized." }

  const result = await prisma.workshop.deleteMany({ where: { id, host_id: userId } })
  if (result.count === 0) return { ok: false, error: "Workshop not found." }

  revalidatePath("/artist/workshops")
  return { ok: true }
}
