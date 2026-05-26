"use client"

import { useEffect, useMemo, useState } from "react"
import { Elements } from "@stripe/react-stripe-js"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getStripe as loadStripeClient } from "@/lib/stripe/client"
import { useCart } from "@/lib/data/cart"

import { CheckoutForm } from "./CheckoutForm"
import { OrderSummary } from "./OrderSummary"
import { RazorpayForm } from "./RazorpayForm"
import { ShippingForm, type ShippingAddress } from "./ShippingForm"

interface SavedAddress extends ShippingAddress {
  id: string
  is_default: boolean
}

interface CheckoutShellProps {
  defaultName: string
  savedAddresses: SavedAddress[]
  stripeReady: boolean
  razorpayReady: boolean
}

type Provider = "stripe" | "razorpay"

export function CheckoutShell({
  defaultName,
  savedAddresses,
  stripeReady,
  razorpayReady,
}: CheckoutShellProps) {
  const cart = useCart((s) => s.items)
  const subtotal = useCart((s) => s.subtotal())

  const [provider, setProvider] = useState<Provider>(
    razorpayReady ? "razorpay" : stripeReady ? "stripe" : "stripe",
  )

  const [shipping, setShipping] = useState<ShippingAddress | null>(
    savedAddresses[0]
      ? {
          full_name: savedAddresses[0].full_name,
          line1: savedAddresses[0].line1,
          line2: savedAddresses[0].line2,
          city: savedAddresses[0].city,
          state: savedAddresses[0].state,
          postal_code: savedAddresses[0].postal_code,
          country: savedAddresses[0].country,
          phone: savedAddresses[0].phone,
        }
      : null,
  )
  const [saveAddress, setSaveAddress] = useState(savedAddresses.length === 0)
  const [stripeIntent, setStripeIntent] = useState<{
    clientSecret: string
    orderId: string
    orderNumber: string
  } | null>(null)
  const [razorpayOrder, setRazorpayOrder] = useState<{
    orderId: string
    orderNumber: string
    razorpayOrderId: string
    amount: number
    currency: string
    keyId: string
    buyer: { email: string; name: string; contact: string }
  } | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stripePromise = useMemo(() => (stripeReady ? loadStripeClient() : null), [stripeReady])

  const createIntent = async (addr: ShippingAddress) => {
    if (!cart.length) return
    setPending(true)
    setError(null)
    try {
      if (provider === "stripe") {
        const res = await fetch("/api/checkout/create-intent", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ items: cart, shippingAddress: addr, saveAddress }),
        })
        const json = await res.json()
        if (!res.ok || !json.ok) throw new Error(json.error ?? "Could not start checkout.")
        setStripeIntent({
          clientSecret: json.clientSecret,
          orderId: json.orderId,
          orderNumber: json.orderNumber,
        })
      } else {
        const res = await fetch("/api/checkout/razorpay/create-order", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ items: cart, shippingAddress: addr, saveAddress }),
        })
        const json = await res.json()
        if (!res.ok || !json.ok) throw new Error(json.error ?? "Could not start checkout.")
        setRazorpayOrder({
          orderId: json.orderId,
          orderNumber: json.orderNumber,
          razorpayOrderId: json.razorpayOrderId,
          amount: json.amount,
          currency: json.currency,
          keyId: json.keyId,
          buyer: json.buyer,
        })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setPending(false)
    }
  }

  // Reset intents if user switches provider
  useEffect(() => {
    setStripeIntent(null)
    setRazorpayOrder(null)
  }, [provider])

  if (cart.length === 0 && !stripeIntent && !razorpayOrder) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-display text-4xl">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add an item and come back.</p>
      </div>
    )
  }

  const anyConfigured = stripeReady || razorpayReady
  const intentSet = stripeIntent ?? razorpayOrder

  return (
    <div className="container-page py-12">
      <h1 className="mb-8 font-display text-4xl">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {!anyConfigured ? (
            <Card>
              <CardContent className="p-5 text-sm">
                Neither Stripe nor Razorpay is configured. Add at least one set
                of credentials to <code>.env.local</code>.
              </CardContent>
            </Card>
          ) : null}

          {/* Provider picker */}
          {anyConfigured && !intentSet ? (
            <Card>
              <CardContent className="p-5">
                <p className="mb-3 text-sm font-medium">Payment method</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={provider === "stripe" ? "default" : "outline"}
                    onClick={() => setProvider("stripe")}
                    disabled={!stripeReady}
                  >
                    Stripe
                    {!stripeReady ? <span className="ml-1 text-xs opacity-60">(off)</span> : null}
                  </Button>
                  <Button
                    type="button"
                    variant={provider === "razorpay" ? "default" : "outline"}
                    onClick={() => setProvider("razorpay")}
                    disabled={!razorpayReady}
                  >
                    Razorpay
                    {!razorpayReady ? <span className="ml-1 text-xs opacity-60">(off)</span> : null}
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {provider === "stripe"
                    ? "Cards, Apple Pay, Google Pay, and 30+ wallets."
                    : "UPI, cards, net banking — best for India."}
                </p>
              </CardContent>
            </Card>
          ) : null}

          {!intentSet ? (
            <ShippingForm
              defaultName={defaultName}
              savedAddresses={savedAddresses}
              saveAddress={saveAddress}
              onSaveAddressChange={setSaveAddress}
              pending={pending}
              onSubmit={(addr) => {
                setShipping(addr)
                createIntent(addr)
              }}
            />
          ) : null}

          {stripeIntent && stripePromise ? (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret: stripeIntent.clientSecret, appearance: { theme: "night" } }}
            >
              <CheckoutForm
                clientSecret={stripeIntent.clientSecret}
                orderId={stripeIntent.orderId}
                orderNumber={stripeIntent.orderNumber}
              />
            </Elements>
          ) : null}

          {razorpayOrder ? <RazorpayForm rz={razorpayOrder} /> : null}

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <OrderSummary subtotal={subtotal} currency={cart[0]?.currency ?? "INR"} items={cart} />
      </div>
      {/* Suppress unused warning */}
      <span className="hidden">{JSON.stringify(shipping)}</span>
    </div>
  )
}
