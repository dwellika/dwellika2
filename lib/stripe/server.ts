import "server-only"

import Stripe from "stripe"

let cached: Stripe | null = null

export function getStripe(): Stripe {
  if (cached) return cached
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) {
    throw new Error(
      "STRIPE_SECRET_KEY is not configured. Add it to .env.local to enable checkout.",
    )
  }
  cached = new Stripe(secret, {
    apiVersion: "2024-12-18.acacia" as Stripe.StripeConfig["apiVersion"],
    typescript: true,
  })
  return cached
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}
