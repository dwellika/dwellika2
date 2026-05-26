import { NextResponse, type NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getRazorpay, isRazorpayConfigured } from "@/lib/razorpay/server"

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

interface Body {
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
    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        {
          ok: false,
          error: "Razorpay is not configured. Set RAZORPAY_KEY_ID + secret in .env.local.",
        },
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
    const body = (await request.json()) as Body
    if (!body.items?.length) {
      return NextResponse.json({ ok: false, error: "Cart is empty" }, { status: 400 })
    }
    const currency = (body.items[0]?.currency ?? "INR").toUpperCase()
    const subtotal = body.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
    const shipping = subtotal > 2000 ? 0 : 99
    const tax = Math.round(subtotal * 0.05)
    const total = subtotal + shipping + tax
    const amountMinor = Math.round(total * 100)

    const admin = createAdminClient()

    // 1. Create local order
    const { data: order, error: orderErr } = await admin
      .from("orders")
      .insert({
        buyer_id: user.id,
        subtotal,
        shipping,
        tax,
        discount: 0,
        total,
        currency,
        status: "pending",
        shipping_address: body.shippingAddress,
        payment_provider: "razorpay",
      })
      .select("id, order_number")
      .single()
    if (orderErr || !order) {
      return NextResponse.json(
        { ok: false, error: orderErr?.message ?? "Order failed" },
        { status: 500 },
      )
    }

    const o = order as { id: string; order_number: string }

    await admin.from("order_items").insert(
      body.items.map((i) => ({
        order_id: o.id,
        target_kind: i.kind,
        target_id: i.id,
        seller_id: i.sellerId,
        title: i.title,
        image_url: i.image,
        unit_price: i.unitPrice,
        quantity: i.quantity,
      })),
    )

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

    // 2. Create Razorpay order
    const rz = getRazorpay()!
    const rzOrder = await rz.orders.create({
      amount: amountMinor,
      currency,
      receipt: o.order_number,
      notes: { order_id: o.id, buyer_id: user.id },
    })

    await admin
      .from("orders")
      .update({ payment_ref: rzOrder.id })
      .eq("id", o.id)

    return NextResponse.json({
      ok: true,
      orderId: o.id,
      orderNumber: o.order_number,
      razorpayOrderId: rzOrder.id,
      amount: amountMinor,
      currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      buyer: {
        email: user.email,
        name: body.shippingAddress.full_name,
        contact: body.shippingAddress.phone ?? "",
      },
    })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    )
  }
}
