"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { uploadArtwork } from "@/lib/storage/upload"

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 64)
}

type ActionResult = { ok: false; error: string }

export async function createArtwork(formData: FormData): Promise<ActionResult | void> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." }
  const userId = session.user.id

  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim() || null
  const medium = String(formData.get("medium") ?? "").trim() || null
  const style = String(formData.get("style") ?? "").trim() || null
  const subject = String(formData.get("subject") ?? "").trim() || null
  const tags = String(formData.get("tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 12)
  const forSale = formData.get("for_sale") === "on"
  const printsAvailable = formData.get("prints_available") === "on"
  const customSize = formData.get("custom_size_option") === "on"
  const priceRaw = String(formData.get("price") ?? "")
  const price = priceRaw ? Number(priceRaw) : null
  const currency = String(formData.get("currency") ?? "INR")
  const editionSizeRaw = String(formData.get("edition_size") ?? "")
  const editionSize = editionSizeRaw ? Number(editionSizeRaw) : null
  const dimWidth = Number(formData.get("dim_width") ?? 0) || null
  const dimHeight = Number(formData.get("dim_height") ?? 0) || null
  const dimUnit = String(formData.get("dim_unit") ?? "cm")
  const submitForReview = formData.get("submit_for_review") === "on"

  if (!title) return { ok: false, error: "Title is required." }
  if (forSale && (price == null || price <= 0)) return { ok: false, error: "Set a price (>0) when listing for sale." }

  const files = formData.getAll("media") as File[]
  if (files.length === 0 || !files[0]?.size) return { ok: false, error: "Upload at least one image." }

  let slug = slugify(title)
  for (let attempt = 0; attempt < 5; attempt++) {
    const exists = await prisma.artwork.findUnique({ where: { artist_id_slug: { artist_id: userId, slug } }, select: { id: true } })
    if (!exists) break
    slug = `${slugify(title)}-${Math.floor(Math.random() * 9999)}`
  }

  const artwork = await prisma.artwork.create({
    data: {
      artist_id: userId,
      title,
      slug,
      description,
      medium,
      style,
      subject,
      tags,
      for_sale: forSale,
      price: price ?? undefined,
      currency,
      edition_size: editionSize,
      prints_available: printsAvailable,
      custom_size_option: customSize,
      dimensions: dimWidth && dimHeight ? { width: dimWidth, height: dimHeight, unit: dimUnit } : undefined,
      status: submitForReview ? "pending" : "draft",
      published_at: submitForReview ? new Date() : null,
    },
    select: { id: true },
  })

  const mediaData = []
  let position = 0
  for (const file of files) {
    if (!file || !file.size) continue
    const result = await uploadArtwork(file, artwork.id, position)
    mediaData.push({
      artwork_id: artwork.id,
      kind: (file.type.startsWith("video/") ? "video" : "image") as "image" | "video",
      url: result.url,
      position,
      is_primary: position === 0,
    })
    position += 1
  }

  if (mediaData.length > 0) {
    await prisma.artworkMedia.createMany({ data: mediaData })
  }

  revalidateTag("artworks")
  revalidateTag("artists")
  revalidatePath("/artist/dashboard")
  redirect("/artist/dashboard")
}
