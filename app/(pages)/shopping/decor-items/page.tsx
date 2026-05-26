import { ProductCategoryPage } from "@/components/shop/ProductCategoryPage"

export const metadata = {
  title: "Home Decor",
  description: "Vases, prints, lighting, sculptural objects from our verified sellers.",
}

export const revalidate = 60

export default async function DecorPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: "newest" | "popular" | "price_asc" | "price_desc" | "rating"; minPrice?: string; maxPrice?: string }>
}) {
  const params = await searchParams
  return (
    <ProductCategoryPage
      category="home_decor"
      title="Home Decor"
      eyebrow="Shop"
      description="Vases, prints, lighting, sculptural objects from our verified sellers."
      searchParams={params}
    />
  )
}
