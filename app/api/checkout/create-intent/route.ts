import { NextResponse, type NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getStripe, isStripeConfigured } from "@/lib/stripe/server"

interface CartLine {
  kind: "artwork" | "product"
  id: string
  title: string
  image: string | null
  unitPrice: number
  currency: string
  quantity: number
  sellerId: string | null
}

interface CheckoutBody {
  items: CartLine[]
  shippingAddress: {
    full_name: string
    line1: string
    line2?: string | null
    city: string
    state: string
    postal_code: string
    country: string
    phone?: string | null
  }
  saveAddress?: boolean
}

export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Stripe is not configured. Set STRIPE_SECRET_KEY in .env.local." },
        { status: 500 },
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 })
    }

    const body = (await request.json()) as CheckoutBody
    const items = body.items ?? []
    if (items.length === 0) {
      return NextResponse.json({ ok: false, error: "Cart is empty" }, { status: 400 })
    }

    const currency = (items[0]?.currency ?? "INR").toLowerCase()
    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
    const shipping = subtotal > 2000 ? 0 : 99
    const tax = Math.round(subtotal * 0.05)
    const total = subtotal + shipping + tax

    // 1. Insert pending order via service-role (RLS allows buyer_id = auth.uid()
    // already, but we use admin to bypass any tighter rules later on).
    const admin = createAdminClient()

    const { data: order, error: orderErr } = await admin
      .from("orders")
      .insert({
        buyer_id: user.id,
        subtotal,
        shipping,
        tax,
        discount: 0,
        total,
        currency: currency.toUpperCase(),
        status: "pending",
        shipping_address: body.shippingAddress,
        payment_provider: "stripe",
      })
      .select("id, order_number")
      .single()

    if (orderErr || !order) {
      return NextResponse.json(
        { ok: false, error: orderErr?.message ?? "Could not create order" },
        { status: 500 },
      )
    }

    // 2. Insert items
    const itemRows = items.map((i) => ({
      order_id: (order as { id: string }).id,
      target_kind: i.kind,
      target_id: i.id,
      seller_id: i.sellerId,
      title: i.title,
      image_url: i.image,
      unit_price: i.unitPrice,
      quantity: i.quantity,
      metadata: {},
    }))
    const { error: itemErr } = await admin.from("order_items").insert(itemRows)
    if (itemErr) {
      return NextResponse.json({ ok: false, error: itemErr.message }, { status: 500 })
    }

    // 3. Optionally save shipping address for later use
    if (body.saveAddress) {
      await admin.from("addresses").insert({
        user_id: user.id,
        label: "Default",
        full_name: body.shippingAddress.full_name,
        line1: body.shippingAddress.line1,
        line2: body.shippingAddress.line2 ?? null,
        city: body.shippingAddress.city,
        state: body.shippingAddress.state,
        postal_code: body.shippingAddress.postal_code,
        country: body.shippingAddress.country,
        phone: body.shippingAddress.phone ?? null,
        is_default: true,
      })
    }

    // 4. Stripe Payment Intent (amount in smallest unit — paise for INR)
    const stripe = getStripe()
    const amountMinor = Math.round(total * 100)
    const intent = await stripe.paymentIntents.create({
      amount: amountMinor,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        order_id: (order as { id: string }).id,
        buyer_id: user.id,
      },
      description: `Dwellika order ${(order as { order_number: string }).order_number}`,
      receipt_email: user.email ?? undefined,
    })

    // 5. Persist the payment ref on the order
    await admin
      .from("orders")
      .update({ payment_ref: intent.id })
      .eq("id", (order as { id: string }).id)

    return NextResponse.json({
      ok: true,
      orderId: (order as { id: string }).id,
      orderNumber: (order as { order_number: string }).order_number,
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
