import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { ProductCategory } from "@/lib/types/database"
import type { ProductWithMedia } from "./types"

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
  const supabase = await createClient()

  let query = supabase
    .from("products")
    .select(
      `
        id, seller_id, category, title, slug, description, price, currency,
        inventory, sku, tags, attributes, status, rating_avg, rating_count,
        created_at, updated_at,
        product_media ( id, product_id, kind, url, thumbnail_url, position, is_primary ),
        seller:profiles!products_seller_id_fkey ( id, username, full_name, avatar_url )
      `,
      { count: "exact" },
    )
    .eq("status", "approved")

  if (category) query = query.eq("category", category)
  if (sellerId) query = query.eq("seller_id", sellerId)
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
  if (tags && tags.length) query = query.overlaps("tags", tags)
  if (typeof minPrice === "number") query = query.gte("price", minPrice)
  if (typeof maxPrice === "number") query = query.lte("price", maxPrice)
  if (typeof minRating === "number") query = query.gte("rating_avg", minRating)
  if (inStockOnly) query = query.gt("inventory", 0)

  switch (sort) {
    case "price_asc":
      query = query.order("price", { ascending: true })
      break
    case "price_desc":
      query = query.order("price", { ascending: false })
      break
    case "rating":
      query = query.order("rating_avg", { ascending: false, nullsFirst: false })
      break
    case "popular":
      query = query.order("rating_count", { ascending: false })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  const { data, count } = await query.range(offset, offset + limit - 1)
  return {
    products: (data ?? []) as unknown as ProductWithMedia[],
    count: count ?? 0,
  }
}

export interface ProductDetail extends ProductWithMedia {
  seller: {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
    is_verified: boolean
  }
}

export async function getProductBySlug(
  sellerUsername: string,
  slug: string,
): Promise<ProductDetail | null> {
  const supabase = await createClient()
  const { data: seller } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, is_verified")
    .eq("username", sellerUsername)
    .maybeSingle()
  if (!seller) return null
  const sellerRow = seller as unknown as ProductDetail["seller"]

  const { data: product } = await supabase
    .from("products")
    .select(
      `
        id, seller_id, category, title, slug, description, price, currency,
        inventory, sku, tags, attributes, status, rating_avg, rating_count,
        created_at, updated_at,
        product_media ( id, product_id, kind, url, thumbnail_url, position, is_primary )
      `,
    )
    .eq("seller_id", sellerRow.id)
    .eq("slug", slug)
    .maybeSingle()

  if (!product) return null
  return {
    ...(product as unknown as ProductWithMedia),
    seller: sellerRow,
  }
}
