import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { isStripeConfigured } from "@/lib/stripe/server"
import { isRazorpayConfigured } from "@/lib/razorpay/server"

import { CheckoutShell } from "./CheckoutShell"

export const metadata = { title: "Checkout" }

export default async function CheckoutPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/signin?next=/checkout")

  const { data: addresses } = await supabase
    .from("addresses")
    .select("id, full_name, line1, line2, city, state, postal_code, country, phone, is_default")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false })

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle()

  const stripeReady = isStripeConfigured()
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null
  const razorpayReady = isRazorpayConfigured()

  return (
    <CheckoutShell
      defaultName={(profile as { full_name?: string } | null)?.full_name ?? ""}
      savedAddresses={(addresses ?? []) as Array<{
        id: string
        full_name: string
        line1: string
        line2: string | null
        city: string
        state: string
        postal_code: string
        country: string
        phone: string | null
        is_default: boolean
      }>}
      stripeReady={stripeReady && Boolean(publishableKey)}
      razorpayReady={razorpayReady}
    />
  )
}
