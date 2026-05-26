"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/lib/data/cart"

interface CheckoutFormProps {
  clientSecret: string
  orderId: string
  orderNumber: string
}

export function CheckoutForm({ orderId, orderNumber }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const clear = useCart((s) => s.clear)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setPending(true)
    setError(null)

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/${orderId}?paid=1`,
      },
      redirect: "if_required",
    })

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed.")
      setPending(false)
      return
    }

    // Payment succeeded synchronously — webhook will update the row,
    // but we can optimistically navigate.
    clear()
    router.push(`/orders/${orderId}?paid=1`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment · {orderNumber}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <PaymentElement />
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" size="lg" className="w-full" disabled={!stripe || pending}>
            {pending ? "Processing…" : "Pay now"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
