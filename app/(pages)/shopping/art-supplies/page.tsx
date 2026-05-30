import { ProductCategoryPage } from "@/components/shop/ProductCategoryPage"

export const metadata = {
  title: "Art Supplies",
  description: "Brushes, papers, pigments — vetted by working artists.",
}

export const revalidate = 60

const SUPPLY_TAGS = ["Brushes", "Paints", "Paper", "Canvas", "Charcoal", "Pigments"]

interface PageProps {
  searchParams: Promise<{
    q?: string
    tag?: string
    sort?: "newest" | "popular" | "price_asc" | "price_desc" | "rating"
    minPrice?: string
    maxPrice?: string
    page?: string
  }>
}

export default async function SuppliesPage({ searchParams }: PageProps) {
  const params = await searchParams
  return (
    <ProductCategoryPage
      category="art_supplies"
      title="Art Supplies"
      eyebrow="Shop"
      description="Brushes, papers, pigments — vetted by working artists."
      basePath="/shopping/art-supplies"
      filters={[{ id: "tag", label: "Type", options: SUPPLY_TAGS }]}
      searchParams={params}
    />
  )
}
