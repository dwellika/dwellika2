import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { getStripe, isStripeConfigured } from "@/lib/stripe/server"

const addressSchema = z.object({
  full_name: z.string(),
  line1: z.string(),
  line2: z.string().nullish(),
  city: z.string(),
  state: z.string(),
  postal_code: z.string(),
  country: z.string(),
  phone: z.string().nullish(),
})

const bodySchema = z.object({
  items: z.array(z.object({
    kind: z.enum(["artwork", "product"]),
    id: z.string(),
    title: z.string(),
    image: z.string().nullable(),
    unitPrice: z.number().positive(),
    currency: z.string(),
    quantity: z.number().int().positive(),
    sellerId: z.string().nullable(),
  })),
  shippingAddress: addressSchema,
  saveAddress: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ ok: false, error: "Stripe is not configured." }, { status: 500 })
    }

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 })
    }
    const userId = session.user.id

    const parsed = bodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 })
    }

    const { items, shippingAddress, saveAddress } = parsed.data
    if (items.length === 0) {
      return NextResponse.json({ ok: false, error: "Cart is empty" }, { status: 400 })
    }

    const currency = (items[0]?.currency ?? "INR").toLowerCase()
    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
    const shipping = subtotal > 2000 ? 0 : 99
    const tax = Math.round(subtotal * 0.05)
    const total = subtotal + shipping + tax

    const orderNumber = "DWK-" + Math.random().toString(36).toUpperCase().slice(2, 10)

    const order = await prisma.order.create({
      data: {
        order_number: orderNumber,
        buyer_id: userId,
        subtotal,
        shipping,
        tax,
        discount: 0,
        total,
        currency: currency.toUpperCase(),
        status: "pending",
        shipping_address: shippingAddress,
        payment_provider: "stripe",
        order_items: {
          create: items.map((i) => ({
            target_kind: i.kind,
            target_id: i.id,
            seller_id: i.sellerId,
            title: i.title,
            image_url: i.image,
            unit_price: i.unitPrice,
            quantity: i.quantity,
            subtotal: i.unitPrice * i.quantity,
          })),
        },
      },
      select: { id: true, order_number: true },
    })

    if (saveAddress) {
      await prisma.address.create({
        data: {
          user_id: userId,
          label: "Default",
          full_name: shippingAddress.full_name,
          line1: shippingAddress.line1,
          line2: shippingAddress.line2 ?? null,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.postal_code,
          country: shippingAddress.country,
          phone: shippingAddress.phone ?? null,
          is_default: true,
        },
      }).catch(() => {})
    }

    const stripe = getStripe()
    const amountMinor = Math.round(total * 100)
    const intent = await stripe.paymentIntents.create({
      amount: amountMinor,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: { order_id: order.id, buyer_id: userId },
      description: `Dwellika order ${order.order_number}`,
      receipt_email: session.user.email ?? undefined,
    })

    await prisma.order.update({ where: { id: order.id }, data: { payment_ref: intent.id } })

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      orderNumber: order.order_number,
      clientSecret: intent.client_secret,
      amount: amountMinor,
      currency,
    })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    )
  }
}
