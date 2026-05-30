"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { uploadFile } from "@/lib/storage/upload"
import type { ProductCategory } from "@/lib/types/database"

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 64)
}

const VALID_CATEGORIES: ProductCategory[] = ["home_decor", "art_supplies", "wearing_arts"]

type ActionResult = { ok: false; error: string }

export async function createProduct(
  formData: FormData,
): Promise<ActionResult | void> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." }
  const userId = session.user.id

  const title       = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim() || null
  const category    = String(formData.get("category") ?? "art_supplies") as ProductCategory
  const tags        = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12)
  const priceRaw     = String(formData.get("price") ?? "")
  const price        = priceRaw ? Number(priceRaw) : null
  const currency     = String(formData.get("currency") ?? "INR")
  const inventoryRaw = String(formData.get("inventory") ?? "0")
  const inventory    = Math.max(0, parseInt(inventoryRaw, 10) || 0)
  const discountRaw  = String(formData.get("discount_pct") ?? "0")
  const discountPct  = Math.min(100, Math.max(0, parseInt(discountRaw, 10) || 0))
  const sku          = String(formData.get("sku") ?? "").trim() || null
  const submitForReview = formData.get("submit_for_review") === "on"

  if (!title) return { ok: false, error: "Title is required." }
  if (!price || price <= 0) return { ok: false, error: "Enter a valid price greater than 0." }
  if (!VALID_CATEGORIES.includes(category)) {
    return { ok: false, error: "Select a valid category." }
  }

  const files = formData.getAll("media") as File[]
  if (files.length === 0 || !files[0]?.size) {
    return { ok: false, error: "Upload at least one product photo." }
  }

  // Unique slug
  let slug = slugify(title)
  for (let attempt = 0; attempt < 5; attempt++) {
    const exists = await prisma.product.findUnique({
      where:  { seller_id_slug: { seller_id: userId, slug } },
      select: { id: true },
    })
    if (!exists) break
    slug = `${slugify(title)}-${Math.floor(Math.random() * 9999)}`
  }

  const product = await prisma.product.create({
    data: {
      seller_id:    userId,
      category,
      title,
      slug,
      description,
      price,
      currency,
      inventory,
      discount_pct: discountPct,
      sku,
      tags,
      status: submitForReview ? "pending" : "draft",
    },
    select: { id: true },
  })

  // Upload images
  const mediaData: Array<{
    product_id: string
    kind:       "image" | "video"
    url:        string
    position:   number
    is_primary: boolean
  }> = []

  let position = 0
  for (const file of files) {
    if (!file || !file.size) continue
    const result = await uploadFile(file, {
      folder:       `dwellika/products/${userId}`,
      publicId:     `product_${product.id}_${position}`,
      resourceType: "image",
    })
    mediaData.push({
      product_id: product.id,
      kind:       "image",
      url:        result.url,
      position,
      is_primary: position === 0,
    })
    position += 1
  }

  if (mediaData.length > 0) {
    await prisma.productMedia.createMany({ data: mediaData })
  }

  revalidateTag("products")
  revalidatePath("/seller/products")
  revalidatePath("/seller/dashboard")
  redirect("/seller/products")
}
