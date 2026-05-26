import { ProductCategoryPage } from "@/components/shop/ProductCategoryPage"

export const metadata = {
  title: "Wearing Arts",
  description: "Textiles, jewelry, hand-printed apparel — wearable craft.",
}

export const revalidate = 60

export default async function WearingArtsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: "newest" | "popular" | "price_asc" | "price_desc" | "rating"; minPrice?: string; maxPrice?: string }>
}) {
  const params = await searchParams
  return (
    <ProductCategoryPage
      category="wearing_arts"
      title="Wearing Arts"
      eyebrow="Shop"
      description="Textiles, jewelry, hand-printed apparel — wearable craft."
      searchParams={params}
    />
  )
}
