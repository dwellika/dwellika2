import { ProductCard } from "@/components/products/ProductCard"

export default function DecorItemsPage() {
  const decorItems = [
    {
      id: 1,
      title: "Ceramic Vase Collection",
      artist: "PotteryStudio",
      price: 125,
      image: "/placeholder.svg?height=300&width=300",
      category: "Ceramics",
    },
    {
      id: 2,
      title: "Handwoven Wall Tapestry",
      artist: "TextileArt",
      price: 180,
      image: "/placeholder.svg?height=300&width=300",
      category: "Textiles",
    },
    {
      id: 3,
      title: "Sculptural Bookends",
      artist: "MetalCraft",
      price: 95,
      image: "/placeholder.svg?height=300&width=300",
      category: "Sculpture",
    },
    {
      id: 4,
      title: "Artisan Candle Set",
      artist: "CandleCraft",
      price: 48,
      image: "/placeholder.svg?height=300&width=300",
      category: "Home Decor",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Decor Items</h1>
        <p className="text-lg text-muted-foreground">Beautiful handcrafted pieces to enhance your living space</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {decorItems.map((item) => (
          <ProductCard
            key={item.id}
            id={item.id}
            title={item.title}
            artist={item.artist}
            price={item.price}
            image={item.image}
            category={item.category}
          />
        ))}
      </div>
    </div>
  )
}
