import { ProductCard } from "@/components/products/ProductCard"

export default function ArtsPage() {
  const artworks = [
    {
      id: 1,
      title: "Sunset Dreams",
      artist: "Sarah Johnson",
      price: 450,
      image: "/placeholder.svg?height=300&width=300",
      category: "Painting",
    },
    {
      id: 2,
      title: "Urban Rhythm",
      artist: "Mike Chen",
      price: 380,
      image: "/placeholder.svg?height=300&width=300",
      category: "Mixed Media",
    },
    {
      id: 3,
      title: "Nature's Embrace",
      artist: "Emma Davis",
      price: 520,
      image: "/placeholder.svg?height=300&width=300",
      category: "Oil Painting",
    },
    {
      id: 4,
      title: "Digital Cosmos",
      artist: "Alex Rivera",
      price: 280,
      image: "/placeholder.svg?height=300&width=300",
      category: "Digital Art",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Original Artworks</h1>
        <p className="text-lg text-muted-foreground">Discover unique paintings, drawings, and mixed media pieces</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {artworks.map((artwork) => (
          <ProductCard
            key={artwork.id}
            id={artwork.id}
            title={artwork.title}
            artist={artwork.artist}
            price={artwork.price}
            image={artwork.image}
            category={artwork.category}
          />
        ))}
      </div>
    </div>
  )
}
