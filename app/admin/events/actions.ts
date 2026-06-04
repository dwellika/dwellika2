"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

type ActionResult = { ok: true } | { ok: false; error: string }

const KINDS = ["competition", "workshop", "exhibition", "other"] as const

function slugify(s: string) {
  return s.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 56)
}

async function requireAdmin(): Promise<string | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  const role = session.user.role as string | undefined
  if (role !== "admin" && role !== "super_admin") return null
  return session.user.id
}

function parseFields(fd: FormData) {
  const title = String(fd.get("title") ?? "").trim()
  if (!title) return { error: "Title is required." as const }

  const kindRaw = String(fd.get("kind") ?? "exhibition")
  const kind = (KINDS as readonly string[]).includes(kindRaw) ? kindRaw : "exhibition"

  const parseDate = (v: string) => {
    const t = String(v ?? "").trim()
    if (!t) return null
    const d = new Date(t)
    return isNaN(d.getTime()) ? null : d
  }

  return {
    kind,
    title,
    description: String(fd.get("description") ?? "").trim() || null,
    cover_url: String(fd.get("cover_url") ?? "").trim() || null,
    location: String(fd.get("location") ?? "").trim() || null,
    starts_at: parseDate(String(fd.get("starts_at") ?? "")),
    ends_at: parseDate(String(fd.get("ends_at") ?? "")),
    url: String(fd.get("url") ?? "").trim() || null,
    is_published: fd.get("is_published") === "on",
    is_featured: fd.get("is_featured") === "on",
  }
}

export async function createEvent(fd: FormData): Promise<ActionResult | void> {
  const adminId = await requireAdmin()
  if (!adminId) return { ok: false, error: "Admins only." }

  const parsed = parseFields(fd)
  if ("error" in parsed) return { ok: false, error: parsed.error }

  let slug = slugify(parsed.title)
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.event.findUnique({ where: { slug }, select: { id: true } })
    if (!exists) break
    slug = `${slugify(parsed.title)}-${Math.floor(Math.random() * 9999)}`
  }

  await prisma.event.create({ data: { ...parsed, slug, created_by: adminId } })
  revalidatePath("/admin/events")
  redirect("/admin/events")
}

export async function updateEvent(id: string, fd: FormData): Promise<ActionResult | void> {
  const adminId = await requireAdmin()
  if (!adminId) return { ok: false, error: "Admins only." }

  const parsed = parseFields(fd)
  if ("error" in parsed) return { ok: false, error: parsed.error }

  await prisma.event.update({ where: { id }, data: parsed })
  revalidatePath("/admin/events")
  redirect("/admin/events")
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  const adminId = await requireAdmin()
  if (!adminId) return { ok: false, error: "Admins only." }

  await prisma.event.delete({ where: { id } }).catch(() => {})
  revalidatePath("/admin/events")
  return { ok: true }
}
