"use client"

import { loadStripe, type Stripe } from "@stripe/stripe-js"

let cached: Promise<Stripe | null> | null = null

export function getStripe() {
  if (!cached) {
    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    cached = pk ? loadStripe(pk) : Promise.resolve(null)
  }
  return cached
}
