import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function CartPage() {
  const cartItems = [
    {
      id: 1,
      title: "Sunset Dreams",
      artist: "Sarah Johnson",
      price: 450,
      quantity: 1,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 2,
      title: "Professional Brush Set",
      artist: "BrushPro",
      price: 89,
      quantity: 2,
      image: "/placeholder.svg?height=200&width=200",
    },
  ]

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 15
  const total = subtotal + shipping

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

      {cartItems.length > 0 ? (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      width={120}
                      height={120}
                      className="rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-muted-foreground">by {item.artist}</p>
                      <p className="text-lg font-semibold mt-2">${item.price}</p>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="px-3 py-1 border rounded">{item.quantity}</span>
                          <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${shipping}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${total}</span>
                  </div>
                </div>
                <Button asChild className="w-full" size="lg">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some beautiful artworks to get started</p>
          <Button asChild>
            <Link href="/shopping/arts">Browse Artworks</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
