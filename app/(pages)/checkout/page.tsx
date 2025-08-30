import { PaymentForm } from "@/components/checkout/PaymentForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CheckoutPage() {
  const orderItems = [
    {
      id: 1,
      title: "Sunset Dreams",
      artist: "Sarah Johnson",
      price: 450,
      quantity: 1,
    },
    {
      id: 2,
      title: "Professional Brush Set",
      artist: "BrushPro",
      price: 89,
      quantity: 2,
    },
  ]

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 15
  const total = subtotal + shipping

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <div>
          <PaymentForm />
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">by {item.artist}</p>
                      <p className="text-sm">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              <hr className="mb-4" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shipping}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
