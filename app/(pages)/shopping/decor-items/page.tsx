import { ProductCategoryPage } from "@/components/shop/ProductCategoryPage"

export const metadata = {
  title: "Home Decor",
  description: "Vases, prints, lighting, sculptural objects from our verified sellers.",
}

export const revalidate = 60

const DECOR_TAGS = ["Prints", "Sculpture", "Ceramics", "Vases", "Wall Art", "Lighting"]

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

export default async function DecorPage({ searchParams }: PageProps) {
  const params = await searchParams
  return (
    <ProductCategoryPage
      category="home_decor"
      title="Home Decor"
      eyebrow="Shop"
      description="Vases, prints, lighting, sculptural objects from our verified sellers."
      basePath="/shopping/decor-items"
      filters={[{ id: "tag", label: "Category", options: DECOR_TAGS }]}
      searchParams={params}
    />
  )
}
