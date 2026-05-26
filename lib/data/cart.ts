"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  key: string
  kind: "artwork" | "product"
  id: string
  slug?: string
  title: string
  image: string | null
  unitPrice: number
  currency: string
  quantity: number
  sellerId: string | null
  artistUsername?: string | null
}

interface CartState {
  items: CartItem[]
  add: (item: Omit<CartItem, "quantity" | "key">, quantity?: number) => void
  remove: (key: string) => void
  setQuantity: (key: string, quantity: number) => void
  clear: () => void
  totalQuantity: () => number
  subtotal: () => number
}

const keyOf = (kind: CartItem["kind"], id: string) => `${kind}:${id}`

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (incoming, qty = 1) => {
        const key = keyOf(incoming.kind, incoming.id)
        const existing = get().items.find((i) => i.key === key)
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.key === key ? { ...i, quantity: i.quantity + qty } : i,
            ),
          })
        } else {
          set({ items: [...get().items, { ...incoming, key, quantity: qty }] })
        }
      },
      remove: (key) => set({ items: get().items.filter((i) => i.key !== key) }),
      setQuantity: (key, quantity) => {
        const next = Math.max(1, Math.min(20, Math.floor(quantity)))
        set({
          items: get().items.map((i) => (i.key === key ? { ...i, quantity: next } : i)),
        })
      },
      clear: () => set({ items: [] }),
      totalQuantity: () => get().items.reduce((s, i) => s + i.quantity, 0),
      subtotal: () => get().items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
    }),
    {
      name: "dwellika.cart.v1",
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
