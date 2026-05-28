import "server-only"

import { prisma } from "@/lib/prisma"
import type { ProductCategory } from "@/lib/types/database"

export interface ProductListParams {
  q?: string
  category?: ProductCategory
  sellerId?: string
  tags?: string[]
  minPrice?: number
  maxPrice?: number
  minRating?: number
  inStockOnly?: boolean
  sort?: "newest" | "popular" | "price_asc" | "price_desc" | "rating"
  limit?: number
  offset?: number
}

export async function listProducts({
  q,
  category,
  sellerId,
  tags,
  minPrice,
  maxPrice,
  minRating,
  inStockOnly,
  sort = "newest",
  limit = 24,
  offset = 0,
}: ProductListParams = {}) {
  const where = {
    status: "approved" as const,
    ...(category ? { category } : {}),
    ...(sellerId ? { seller_id: sellerId } : {}),
    ...(tags?.length ? { tags: { hasSome: tags } } : {}),
    ...(inStockOnly ? { inventory: { gt: 0 } } : {}),
    ...(typeof minPrice === "number" || typeof maxPrice === "number"
      ? { price: { ...(typeof minPrice === "number" ? { gte: minPrice } : {}), ...(typeof maxPrice === "number" ? { lte: maxPrice } : {}) } }
      : {}),
    ...(typeof minRating === "number" ? { rating_avg: { gte: minRating } } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const orderBy =
    sort === "price_asc"
      ? { price: "asc" as const }
      : sort === "price_desc"
        ? { price: "desc" as const }
        : sort === "rating"
          ? { rating_avg: "desc" as const }
          : sort === "popular"
            ? { rating_count: "desc" as const }
            : { created_at: "desc" as const }

  const [products, count] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: {
        product_media: { orderBy: { position: "asc" } },
        seller: { select: { id: true, username: true, full_name: true, avatar_url: true } },
      },
      orderBy,
      take: limit,
      skip: offset,
    }),
    prisma.product.count({ where }),
  ])

  return { products, count }
}

export async function getProductBySlug(sellerUsername: string, slug: string) {
  const seller = await prisma.user.findFirst({
    where: { username: sellerUsername },
    select: { id: true, username: true, full_name: true, avatar_url: true, is_verified: true },
  })
  if (!seller) return null

  const product = await prisma.product.findFirst({
    where: { seller_id: seller.id, slug },
    include: { product_media: { orderBy: { position: "asc" } } },
  })
  if (!product) return null

  return { ...product, seller }
}
