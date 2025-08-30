import { ProductCard } from "@/components/products/ProductCard"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

export default function WishlistPage() {
  const wishlistItems = [
    {
      id: 1,
      title: "Ocean Dreams",
      artist: "Sarah Johnson",
      price: 450,
      image: "/placeholder.svg?height=300&width=300",
      category: "Painting",
    },
    {
      id: 2,
      title: "Professional Brush Set",
      artist: "BrushPro",
      price: 89,
      image: "/placeholder.svg?height=300&width=300",
      category: "Supplies",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Wishlist</h1>
          <p className="text-lg text-muted-foreground">Items you've saved for later</p>
        </div>
        <div className="flex items-center text-muted-foreground">
          <Heart className="w-5 h-5 mr-2" />
          <span>{wishlistItems.length} items</span>
        </div>
      </div>

      {wishlistItems.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
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
      ) : (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6">Start browsing and save items you love</p>
          <Button asChild>
            <a href="/shopping/arts">Browse Artworks</a>
          </Button>
        </div>
      )}
    </div>
  )
}
