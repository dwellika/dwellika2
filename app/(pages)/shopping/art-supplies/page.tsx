import { ProductCategoryPage } from "@/components/shop/ProductCategoryPage"

export const metadata = {
  title: "Art Supplies",
  description: "Brushes, papers, pigments — vetted by working artists.",
}

export const revalidate = 60

export default async function SuppliesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: "newest" | "popular" | "price_asc" | "price_desc" | "rating"; minPrice?: string; maxPrice?: string }>
}) {
  const params = await searchParams
  return (
    <ProductCategoryPage
      category="art_supplies"
      title="Art Supplies"
      eyebrow="Shop"
      description="Brushes, papers, pigments — vetted by working artists."
      searchParams={params}
    />
  )
}
