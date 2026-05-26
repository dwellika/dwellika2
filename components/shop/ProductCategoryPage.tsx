import { ProductCard } from "@/components/products/ProductCard"
import { ShopToolbar } from "@/components/shop/ShopToolbar"
import { getCurrentUser } from "@/lib/auth/rbac"
import { listProducts } from "@/lib/data/products"
import type { ProductCategory } from "@/lib/types/database"

interface ProductCategoryPageProps {
  category: ProductCategory
  title: string
  eyebrow: string
  description: string
  filters?: Array<{ id: string; label: string; options: string[] }>
  searchParams: {
    q?: string
    sort?: "newest" | "popular" | "price_asc" | "price_desc" | "rating"
    minPrice?: string
    maxPrice?: string
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
  filters = [],
  searchParams,
}: ProductCategoryPageProps) {
  const { q, sort = "newest", minPrice, maxPrice } = searchParams
  const viewer = await getCurrentUser()

  const { products, count } = await listProducts({
    category,
    q,
    sort,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    limit: 32,
  })

  return (
    <div className="container-page py-12">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">{eyebrow}</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {count > 0 ? `${count.toLocaleString()} items in this category.` : description}
        </p>
      </header>

      <ShopToolbar
        searchPlaceholder={`Search ${title.toLowerCase()}…`}
        sortOptions={SORTS}
        filters={filters}
        priceRange={{ min: 0, max: 50000 }}
      />

      {products.length === 0 ? (
        <EmptyState />
      ) : (
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
