"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SmartImage } from "@/components/ui/smart-image"
import type { CartItem } from "@/lib/data/cart"

interface OrderSummaryProps {
  items: CartItem[]
  subtotal: number
  currency: string
}

export function OrderSummary({ items, subtotal, currency }: OrderSummaryProps) {
  const shipping = subtotal > 0 ? (subtotal > 2000 ? 0 : 99) : 0
  const tax = Math.round(subtotal * 0.05)
  const total = subtotal + shipping + tax

  return (
    <Card className="h-fit lg:sticky lg:top-24">
      <CardContent className="space-y-4 p-6">
        <h2 className="font-display text-xl">Your order</h2>
        <ul className="space-y-3">
          {items.map((i) => (
            <li key={i.key} className="flex gap-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-md">
                <SmartImage
                  src={i.image}
                  alt={i.title}
                  kind={i.kind === "product" ? "product" : "artwork"}
                  seed={i.title}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium">{i.title}</p>
                <p className="text-xs text-muted-foreground">Qty {i.quantity}</p>
              </div>
              <p className="shrink-0 tabular-nums">
                {formatPrice(i.unitPrice * i.quantity, i.currency)}
              </p>
            </li>
          ))}
        </ul>
        <Separator />
        <Row label="Subtotal" value={formatPrice(subtotal, currency)} />
        <Row label="Shipping" value={shipping === 0 ? "Free" : formatPrice(shipping, currency)} />
        <Row label="Tax (estimated)" value={formatPrice(tax, currency)} />
        <Separator />
        <Row label="Total" value={formatPrice(total, currency)} bold />
      </CardContent>
    </Card>
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
