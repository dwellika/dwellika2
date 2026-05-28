import { NextResponse, type NextRequest } from "next/server"
import type Stripe from "stripe"

import { prisma } from "@/lib/prisma"
import { getStripe, isStripeConfigured } from "@/lib/stripe/server"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ ok: false, error: "Stripe not configured" }, { status: 500 })
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ ok: false, error: "STRIPE_WEBHOOK_SECRET not set" }, { status: 500 })
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

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent
        const orderId = intent.metadata?.order_id
        if (!orderId) break

        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "confirmed",
            paid_at: new Date(),
            payment_provider: "stripe",
            payment_ref: intent.id,
          },
        })

        await prisma.orderTrackingEvent.create({
          data: { order_id: orderId, status: "confirmed", note: "Payment received" },
        })

        const order = await prisma.order.findUnique({
          where: { id: orderId },
          select: { buyer_id: true, order_number: true },
        })
        if (order) {
          await prisma.notification.create({
            data: {
              user_id: order.buyer_id,
              kind: "order_update",
              title: `Order ${order.order_number} confirmed`,
              body: "Your payment was received and the order is being prepared.",
              action_url: `/orders/${orderId}`,
              payload: { order_id: orderId },
            },
          })
        }
        break
      }
      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent
        const orderId = intent.metadata?.order_id
        if (!orderId) break
        await prisma.order.update({ where: { id: orderId }, data: { status: "cancelled" } })
        await prisma.orderTrackingEvent.create({
          data: {
            order_id: orderId,
            status: "cancelled",
            note: intent.last_payment_error?.message ?? "Payment failed",
          },
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
