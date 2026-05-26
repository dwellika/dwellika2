"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Not authenticated." }

  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim() || null
  const medium = String(formData.get("medium") ?? "").trim() || null
  const style = String(formData.get("style") ?? "").trim() || null
  const subject = String(formData.get("subject") ?? "").trim() || null
  const tagsRaw = String(formData.get("tags") ?? "")
  const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 12)
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
  if (forSale && (price == null || price <= 0)) {
    return { ok: false, error: "Set a price (>0) when listing for sale." }
  }

  const files = formData.getAll("media") as File[]
  if (files.length === 0 || !files[0]?.size) {
    return { ok: false, error: "Upload at least one image." }
  }

  // Build a unique slug per artist
  let slug = slugify(title)
  let attempt = 0
  while (attempt < 5) {
    const { count } = await supabase
      .from("artworks")
      .select("*", { count: "exact", head: true })
      .eq("artist_id", user.id)
      .eq("slug", slug)
    if (!count) break
    attempt++
    slug = `${slugify(title)}-${Math.floor(Math.random() * 9999)}`
  }

  // Insert artwork row first
  const { data: artwork, error: insertErr } = await supabase
    .from("artworks")
    .insert({
      artist_id: user.id,
      title,
      slug,
      description,
      medium,
      style,
      subject,
      tags,
      for_sale: forSale,
      price,
      currency,
      edition_size: editionSize,
      prints_available: printsAvailable,
      custom_size_option: customSize,
      dimensions:
        dimWidth && dimHeight ? { width: dimWidth, height: dimHeight, unit: dimUnit } : null,
      status: submitForReview ? "pending" : "draft",
      published_at: submitForReview ? new Date().toISOString() : null,
    })
    .select("id, slug")
    .single()

  if (insertErr || !artwork) {
    return { ok: false, error: insertErr?.message ?? "Could not create artwork." }
  }

  const artworkId = (artwork as { id: string }).id

  // Upload each image to Supabase Storage
  const mediaRows: Array<{
    artwork_id: string
    kind: "image" | "video"
    url: string
    position: number
    is_primary: boolean
  }> = []

  let position = 0
  for (const file of files) {
    if (!file || !file.size) continue
    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase()
    const path = `${user.id}/${artworkId}/${position}-${Date.now()}.${ext}`

    const { error: upErr } = await supabase.storage
      .from("artworks")
      .upload(path, file, { contentType: file.type, upsert: false })

    if (upErr) {
      return { ok: false, error: `Upload failed: ${upErr.message}` }
    }

    const { data: pub } = supabase.storage.from("artworks").getPublicUrl(path)
    mediaRows.push({
      artwork_id: artworkId,
      kind: file.type.startsWith("video/") ? "video" : "image",
      url: pub.publicUrl,
      position,
      is_primary: position === 0,
    })
    position += 1
  }

  if (mediaRows.length > 0) {
    const { error: mediaErr } = await supabase.from("artwork_media").insert(mediaRows)
    if (mediaErr) {
      return { ok: false, error: `Media insert failed: ${mediaErr.message}` }
    }
  }

  revalidatePath("/artist/dashboard")
  redirect("/artist/dashboard")
}
