import "server-only"

import { prisma } from "@/lib/prisma"
import type { ProductCategory } from "@/lib/types/database"

// Prisma Decimal can't be serialised to a Client Component — coerce the money
// fields (price, rating_avg) to plain numbers before returning.
function serializeProduct<T extends { price: unknown; rating_avg: unknown }>(p: T) {
  return {
    ...p,
    price: p.price == null ? null : Number(p.price),
    rating_avg: p.rating_avg == null ? null : Number(p.rating_avg),
  }
}

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

  return { products: products.map(serializeProduct), count }
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

  return serializeProduct({ ...product, seller })
}

// ─── Seller-side helpers ──────────────────────────────────────────────────────

export async function listSellerProducts(sellerId: string) {
  const products = await prisma.product.findMany({
    where: { seller_id: sellerId },
    include: { product_media: { where: { is_primary: true }, take: 1 } },
    orderBy: { created_at: "desc" },
  })
  return products.map(serializeProduct)
}

export async function updateProductInventory(
  productId: string,
  sellerId: string,
  inventory: number,
) {
  if (inventory < 0) throw new Error("Inventory cannot be negative.")
  return prisma.product.update({
    where: { id: productId, seller_id: sellerId },
    data: { inventory },
  })
}

export async function submitProductForReview(productId: string, sellerId: string) {
  return prisma.product.update({
    where: { id: productId, seller_id: sellerId, status: { in: ["draft", "rejected"] } },
    data: { status: "pending" },
  })
}

export async function deleteSellerProduct(productId: string, sellerId: string) {
  // Only allow deletion of non-approved products
  return prisma.product.delete({
    where: { id: productId, seller_id: sellerId, status: { in: ["draft", "rejected"] } },
  })
}
