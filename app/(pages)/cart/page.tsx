"use client"

import Link from "next/link"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SmartImage } from "@/components/ui/smart-image"
import { useCart } from "@/lib/data/cart"

export default function CartPage() {
  const items = useCart((s) => s.items)
  const setQuantity = useCart((s) => s.setQuantity)
  const remove = useCart((s) => s.remove)
  const subtotal = useCart((s) => s.subtotal())

  const shipping = subtotal > 0 ? (subtotal > 2000 ? 0 : 99) : 0
  const tax = Math.round(subtotal * 0.05)
  const total = subtotal + shipping + tax
  const currency = items[0]?.currency ?? "INR"

  if (items.length === 0) {
    return (
      <div className="container-page py-20">
        <div className="mx-auto max-w-md text-center">
          <ShoppingBag className="mx-auto size-12 text-muted-foreground" />
          <h1 className="mt-4 font-display text-3xl">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">
            Discover a piece worth living with.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <Link href="/shopping/arts">Browse artworks</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/shopping/decor-items">Home decor</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-page py-12">
      <h1 className="mb-8 font-display text-4xl">Cart</h1>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.key}>
              <CardContent className="flex gap-4 p-5">
                <div className="relative size-24 shrink-0 overflow-hidden rounded-lg">
                  <SmartImage
                    src={item.image}
                    alt={item.title}
                    kind={item.kind === "product" ? "product" : "artwork"}
                    seed={item.title}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={
                          item.kind === "artwork" && item.artistUsername
                            ? `/artworks/${item.artistUsername}/${item.slug}`
                            : item.kind === "product"
                              ? `/products/${item.slug ?? item.id}`
                              : "#"
                        }
                        className="line-clamp-1 font-display text-lg hover:underline"
                      >
                        {item.title}
                      </Link>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">
                        {item.kind}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(item.key)}
                      aria-label="Remove"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="inline-flex items-center rounded-md border border-border">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuantity(item.key, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease"
                      >
                        <Minus className="size-3.5" />
                      </Button>
                      <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuantity(item.key, item.quantity + 1)}
                        aria-label="Increase"
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                    <p className="font-display text-base tabular-nums">
                      {formatPrice(item.unitPrice * item.quantity, item.currency)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardContent className="space-y-4 p-6">
            <h2 className="font-display text-xl">Order summary</h2>
            <Row label="Subtotal" value={formatPrice(subtotal, currency)} />
            <Row
              label="Shipping"
              value={shipping === 0 ? "Free" : formatPrice(shipping, currency)}
            />
            <Row label="Tax (estimated)" value={formatPrice(tax, currency)} />
            <Separator />
            <Row label="Total" value={formatPrice(total, currency)} bold />
            <Button asChild size="lg" className="w-full">
              <Link href="/checkout">Checkout</Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Secure checkout powered by Stripe.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between text-sm ${bold ? "font-display text-lg" : ""}`}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}

function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}
