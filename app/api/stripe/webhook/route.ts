import { NextResponse, type NextRequest } from "next/server"
import type Stripe from "stripe"

import { createAdminClient } from "@/lib/supabase/admin"
import { getStripe, isStripeConfigured } from "@/lib/stripe/server"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ ok: false, error: "Stripe not configured" }, { status: 500 })
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "STRIPE_WEBHOOK_SECRET not set" },
      { status: 500 },
    )
  }

  const stripe = getStripe()
  const sig = request.headers.get("stripe-signature")
  const rawBody = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig ?? "", secret)
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Bad signature" },
      { status: 400 },
    )
  }

  const admin = createAdminClient()

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent
        const orderId = intent.metadata?.order_id
        if (!orderId) break

        await admin
          .from("orders")
          .update({
            status: "confirmed",
            paid_at: new Date().toISOString(),
            payment_provider: "stripe",
            payment_ref: intent.id,
          })
          .eq("id", orderId)

        await admin.from("order_tracking_events").insert({
          order_id: orderId,
          status: "confirmed",
          note: "Payment received",
        })

        // Notify buyer
        const { data: order } = await admin
          .from("orders")
          .select("buyer_id, order_number")
          .eq("id", orderId)
          .single()

        if (order) {
          const o = order as { buyer_id: string; order_number: string }
          await admin.from("notifications").insert({
            user_id: o.buyer_id,
            kind: "order_update",
            title: `Order ${o.order_number} confirmed`,
            body: "Your payment was received and the order is being prepared.",
            action_url: `/orders/${orderId}`,
            payload: { order_id: orderId },
          })
        }
        break
      }
      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent
        const orderId = intent.metadata?.order_id
        if (!orderId) break
        await admin
          .from("orders")
          .update({ status: "cancelled" })
          .eq("id", orderId)
        await admin.from("order_tracking_events").insert({
          order_id: orderId,
          status: "cancelled",
          note: intent.last_payment_error?.message ?? "Payment failed",
        })
        break
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Webhook handler error" },
      { status: 500 },
    )
  }
}
