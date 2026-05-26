"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/data/cart"

export function CartIndicator() {
  const count = useCart((s) => s.totalQuantity())
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <Button variant="ghost" size="icon" asChild aria-label="Cart" className="relative">
      <Link href="/cart">
        <ShoppingBag className="size-5" />
        {mounted && count > 0 ? (
          <span className="absolute -right-1 -top-1 grid size-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </Link>
    </Button>
  )
}
