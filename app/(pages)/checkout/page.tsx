import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { isStripeConfigured } from "@/lib/stripe/server"
import { isRazorpayConfigured } from "@/lib/razorpay/server"

import { CheckoutShell } from "./CheckoutShell"

export const metadata = { title: "Checkout" }

export default async function CheckoutPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin?next=/checkout")

  const [addresses, profile] = await Promise.all([
    prisma.address.findMany({
      where: { user_id: session.user.id },
      select: {
        id: true,
        full_name: true,
        line1: true,
        line2: true,
        city: true,
        state: true,
        postal_code: true,
        country: true,
        phone: true,
        is_default: true,
      },
      orderBy: [{ is_default: "desc" }, { created_at: "desc" }],
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { full_name: true },
    }),
  ])

  const stripeReady = isStripeConfigured()
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null
  const razorpayReady = isRazorpayConfigured()

  return (
    <CheckoutShell
      defaultName={profile?.full_name ?? ""}
      savedAddresses={addresses}
      stripeReady={stripeReady && Boolean(publishableKey)}
      razorpayReady={razorpayReady}
    />
  )
}
