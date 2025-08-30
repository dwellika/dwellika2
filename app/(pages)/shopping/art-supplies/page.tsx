import { ProductCard } from "@/components/products/ProductCard"

export default function ArtSuppliesPage() {
  const supplies = [
    {
      id: 1,
      title: "Professional Acrylic Paint Set",
      artist: "ArtMaster",
      price: 89,
      image: "/placeholder.svg?height=300&width=300",
      category: "Paint",
    },
    {
      id: 2,
      title: "Canvas Boards Pack (10)",
      artist: "CanvasCraft",
      price: 45,
      image: "/placeholder.svg?height=300&width=300",
      category: "Canvas",
    },
    {
      id: 3,
      title: "Watercolor Brush Set",
      artist: "BrushPro",
      price: 65,
      image: "/placeholder.svg?height=300&width=300",
      category: "Brushes",
    },
    {
      id: 4,
      title: "Drawing Pencil Kit",
      artist: "SketchMaster",
      price: 32,
      image: "/placeholder.svg?height=300&width=300",
      category: "Drawing",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Art Supplies</h1>
        <p className="text-lg text-muted-foreground">Professional tools and materials for creating your masterpieces</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {supplies.map((supply) => (
          <ProductCard
            key={supply.id}
            id={supply.id}
            title={supply.title}
            artist={supply.artist}
            price={supply.price}
            image={supply.image}
            category={supply.category}
          />
        ))}
      </div>
    </div>
  )
}
