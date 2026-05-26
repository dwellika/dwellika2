import crypto from "node:crypto"

import { NextResponse, type NextRequest } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ ok: false, error: "RAZORPAY_WEBHOOK_SECRET missing" }, { status: 500 })
  }
  const signature = request.headers.get("x-razorpay-signature") ?? ""
  const raw = await request.text()
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex")
  if (expected !== signature) {
    return NextResponse.json({ ok: false, error: "Bad signature" }, { status: 400 })
  }

  let event: { event: string; payload: Record<string, unknown> }
  try {
    event = JSON.parse(raw) as typeof event
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 })
  }

  const admin = createAdminClient()

  try {
    switch (event.event) {
      case "payment.captured":
      case "order.paid": {
        const payload = event.payload as {
          payment?: { entity?: { order_id?: string; id?: string; notes?: Record<string, string> } }
          order?: { entity?: { id?: string; notes?: Record<string, string> } }
        }
        const orderId =
          payload.payment?.entity?.notes?.order_id ?? payload.order?.entity?.notes?.order_id
        const paymentRef = payload.payment?.entity?.id ?? payload.order?.entity?.id ?? null
        if (!orderId) break

        await admin
          .from("orders")
          .update({
            status: "confirmed",
            paid_at: new Date().toISOString(),
            payment_provider: "razorpay",
            payment_ref: paymentRef ?? undefined,
          })
          .eq("id", orderId)

        await admin.from("order_tracking_events").insert({
          order_id: orderId,
          status: "confirmed",
          note: "Payment received via Razorpay",
        })

        const { data: ord } = await admin
          .from("orders")
          .select("buyer_id, order_number")
          .eq("id", orderId)
          .single()
        const o = ord as { buyer_id: string; order_number: string } | null
        if (o) {
          await admin.from("notifications").insert({
            user_id: o.buyer_id,
            kind: "order_update",
            title: `Order ${o.order_number} confirmed`,
            body: "Your payment was received and the order is being prepared.",
            action_url: `/orders/${orderId}`,
          })
        }
        break
      }
      case "payment.failed": {
        const payload = event.payload as {
          payment?: { entity?: { notes?: Record<string, string>; error_description?: string } }
        }
        const orderId = payload.payment?.entity?.notes?.order_id
        if (!orderId) break
        await admin
          .from("orders")
          .update({ status: "cancelled" })
          .eq("id", orderId)
        await admin.from("order_tracking_events").insert({
          order_id: orderId,
          status: "cancelled",
          note: payload.payment?.entity?.error_description ?? "Razorpay payment failed",
        })
        break
      }
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Webhook error" },
      { status: 500 },
    )
  }
}
