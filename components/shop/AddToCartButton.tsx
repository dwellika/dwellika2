"use client"

import { useRouter } from "next/navigation"
import { ShoppingBag } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useCart, type CartItem } from "@/lib/data/cart"

interface AddToCartButtonProps {
  item: Omit<CartItem, "quantity" | "key">
  quantity?: number
  size?: "default" | "lg" | "sm"
  className?: string
  label?: string
  disabled?: boolean
  goToCart?: boolean
}

export function AddToCartButton({
  item,
  quantity = 1,
  size = "lg",
  className,
  label = "Add to cart",
  disabled,
  goToCart = false,
}: AddToCartButtonProps) {
  const router = useRouter()
  const cart = useCart()

  return (
    <Button
      type="button"
      size={size}
      className={className}
      disabled={disabled}
      onClick={() => {
        cart.add(item, quantity)
        toast.success(`Added to cart: ${item.title}`)
        if (goToCart) router.push("/cart")
      }}
    >
      <ShoppingBag className="size-4" />
      {label}
    </Button>
  )
}
