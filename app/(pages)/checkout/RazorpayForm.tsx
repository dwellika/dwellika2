"use client"

import Script from "next/script"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/lib/data/cart"

interface RazorpayOrder {
  orderId: string
  orderNumber: string
  razorpayOrderId: string
  amount: number
  currency: string
  keyId: string
  buyer: { email: string; name: string; contact: string }
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void
      on: (event: string, cb: (response: unknown) => void) => void
    }
  }
}

export function RazorpayForm({ rz }: { rz: RazorpayOrder }) {
  const router = useRouter()
  const clearCart = useCart((s) => s.clear)
  const [scriptReady, setScriptReady] = useState(false)
  const [pending, setPending] = useState(false)

  const openCheckout = () => {
    if (!window.Razorpay) {
      toast.error("Razorpay SDK not loaded yet.")
      return
    }
    setPending(true)
    const checkout = new window.Razorpay({
      key: rz.keyId,
      amount: rz.amount,
      currency: rz.currency,
      name: "Dwellika",
      description: `Order ${rz.orderNumber}`,
      order_id: rz.razorpayOrderId,
      prefill: rz.buyer,
      theme: { color: "#C75D3F" },
      handler: () => {
        clearCart()
        router.push(`/orders/${rz.orderId}?paid=1`)
      },
      modal: {
        ondismiss: () => {
          setPending(false)
        },
      },
    })
    checkout.on("payment.failed", (response: unknown) => {
      setPending(false)
      const err = response as { error?: { description?: string } }
      toast.error(err.error?.description ?? "Payment failed.")
    })
    checkout.open()
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onReady={() => setScriptReady(true)}
        onLoad={() => setScriptReady(true)}
      />
      <Card>
        <CardHeader>
          <CardTitle>Payment · {rz.orderNumber}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            UPI, cards, and net banking — secured by Razorpay.
          </p>
          <Button
            size="lg"
            className="w-full"
            disabled={!scriptReady || pending}
            onClick={openCheckout}
          >
            {pending ? "Opening Razorpay…" : "Pay now"}
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
