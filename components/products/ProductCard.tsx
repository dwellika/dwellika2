import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart } from "lucide-react"
import Image from "next/image"

interface ProductCardProps {
  id: number
  title: string
  artist: string
  price: number
  image: string
  category: string
}

export function ProductCard({ id, title, artist, price, image, category }: ProductCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow group">
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            width={300}
            height={300}
            className="w-full h-64 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
          />
          <Badge className="absolute top-2 left-2" variant="secondary">
            {category}
          </Badge>
          <Button variant="ghost" size="sm" className="absolute top-2 right-2 bg-white/80 hover:bg-white">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-4">
          <h3 className="font-semibold mb-1 line-clamp-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-2">by {artist}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">${price}</span>
            <Button size="sm">
              <ShoppingCart className="w-4 h-4 mr-1" />
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
