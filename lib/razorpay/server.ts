import "server-only"

import Razorpay from "razorpay"

let cached: Razorpay | null = null

export function getRazorpay(): Razorpay | null {
  if (cached) return cached
  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET
  if (!key_id || !key_secret) return null
  cached = new Razorpay({ key_id, key_secret })
  return cached
}

export function isRazorpayConfigured(): boolean {
  return Boolean(
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET &&
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  )
}
