import { Suspense } from "react"

import { PaginationControls } from "@/components/ui/pagination-controls"
import { ProductCard } from "@/components/products/ProductCard"
import { ShopToolbar } from "@/components/shop/ShopToolbar"
import { getCurrentUser } from "@/lib/auth/rbac"
import { listProducts } from "@/lib/data/products"
import type { ProductCategory } from "@/lib/types/database"

const PAGE_SIZE = 24

interface ProductCategoryPageProps {
  category: ProductCategory
  title: string
  eyebrow: string
  description: string
  /** Used by PaginationControls to build page-link URLs. */
  basePath: string
  filters?: Array<{ id: string; label: string; options: string[] }>
  searchParams: {
    q?: string
    /** Generic tag filter — matches any product whose `tags` array contains this value. */
    tag?: string
    sort?: "newest" | "popular" | "price_asc" | "price_desc" | "rating"
    minPrice?: string
    maxPrice?: string
    page?: string
  }
}

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Best selling" },
  { value: "rating", label: "Top rated" },
  { value: "price_asc", label: "Price: low → high" },
  { value: "price_desc", label: "Price: high → low" },
]

export async function ProductCategoryPage({
  category,
  title,
  eyebrow,
  description,
  basePath,
  filters = [],
  searchParams,
}: ProductCategoryPageProps) {
  const { q, tag, sort = "newest", minPrice, maxPrice, page: pageStr } = searchParams
  const page = Math.max(1, Number(pageStr ?? 1) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const viewer = await getCurrentUser()

  // ISR page: never let a Prisma/DB failure crash the route — fall back to the
  // empty state instead (see README "ISR + DB build resilience").
  const { products, count } = await listProducts({
    category,
    q,
    tags: tag ? [tag] : undefined,
    sort,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    limit: PAGE_SIZE,
    offset,
  }).catch(() => ({ products: [], count: 0 }))

  // Build filter list: always include the tag filter if options are provided,
  // plus any extra filters passed by the caller.
  const allFilters = filters

  return (
    <div className="container-page pb-12 pt-16 sm:pt-20">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">{eyebrow}</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {count > 0 ? `${count.toLocaleString()} items in this category.` : description}
        </p>
      </header>

      <Suspense>
        <ShopToolbar
          searchPlaceholder={`Search ${title.toLowerCase()}…`}
          sortOptions={SORTS}
          filters={allFilters}
          priceRange={{ min: 0, max: 50000 }}
        />
      </Suspense>

      {products.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                seller={
                  p.seller
                    ? {
                        id: p.seller_id,
                        username: p.seller.username,
                        full_name: p.seller.full_name,
                      }
                    : null
                }
                isAuthed={Boolean(viewer)}
              />
            ))}
          </div>

          <PaginationControls
            page={page}
            totalCount={count}
            pageSize={PAGE_SIZE}
            searchParams={searchParams as Record<string, string | undefined>}
            basePath={basePath}
          />
        </>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-16 text-center">
      <p className="font-display text-2xl">Nothing here yet.</p>
      <p className="mt-2 text-muted-foreground">
        Verified sellers are onboarding — fresh inventory will appear here.
      </p>
    </div>
  )
}
