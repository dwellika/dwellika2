import { ProductCategoryPage } from "@/components/shop/ProductCategoryPage"

export const metadata = {
  title: "Wearing Arts",
  description: "Textiles, jewelry, hand-printed apparel — wearable craft.",
}

export const revalidate = 60

const WEARING_TAGS = ["Jewelry", "Clothing", "Textiles", "Accessories", "Bags", "Scarves"]

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

export default async function WearingArtsPage({ searchParams }: PageProps) {
  const params = await searchParams
  return (
    <ProductCategoryPage
      category="wearing_arts"
      title="Wearing Arts"
      eyebrow="Shop"
      description="Textiles, jewelry, hand-printed apparel — wearable craft."
      basePath="/shopping/wearing-arts"
      filters={[{ id: "tag", label: "Type", options: WEARING_TAGS }]}
      searchParams={params}
    />
  )
}
