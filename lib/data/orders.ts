import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { OrderWithItems, OrderTrackingEventRow } from "./types"

export async function listMyOrders(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("orders")
    .select(
      `
        id, order_number, buyer_id, subtotal, shipping, tax, discount, total,
        currency, status, shipping_address, billing_address, payment_provider,
        payment_ref, paid_at, created_at,
        order_items ( id, order_id, target_kind, target_id, seller_id, title,
                      image_url, unit_price, quantity, subtotal, metadata )
      `,
    )
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false })
  return (data ?? []) as unknown as OrderWithItems[]
}

export async function getOrderById(orderId: string, userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("orders")
    .select(
      `
        id, order_number, buyer_id, subtotal, shipping, tax, discount, total,
        currency, status, shipping_address, billing_address, payment_provider,
        payment_ref, paid_at, created_at,
        order_items ( id, order_id, target_kind, target_id, seller_id, title,
                      image_url, unit_price, quantity, subtotal, metadata ),
        order_tracking_events ( id, order_id, status, note, carrier, tracking_number, occurred_at )
      `,
    )
    .eq("id", orderId)
    .maybeSingle()
  if (!data) return null
  const row = data as unknown as OrderWithItems
  if (row.buyer_id !== userId) {
    // also allow sellers — check that any order_item.seller_id === userId
    const isSeller = row.order_items.some((oi) => oi.seller_id === userId)
    if (!isSeller) return null
  }
  // sort tracking events newest first
  row.order_tracking_events = (row.order_tracking_events ?? []).sort(
    (a: OrderTrackingEventRow, b: OrderTrackingEventRow) =>
      new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime(),
  )
  return row
}

export async function listSellerOrders(sellerId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("order_items")
    .select(
      `
        id, order_id, target_kind, target_id, title, image_url, unit_price, quantity, subtotal,
        order:orders!order_items_order_id_fkey (
          id, order_number, buyer_id, status, total, currency, created_at,
          buyer:profiles!orders_buyer_id_fkey ( username, full_name, avatar_url )
        )
      `,
    )
    .eq("seller_id", sellerId)
    .order("id", { ascending: false })

  return (data ?? []) as unknown as Array<{
    id: string
    order_id: string
    title: string
    image_url: string | null
    unit_price: number
    quantity: number
    subtotal: number
    order: {
      id: string
      order_number: string
      buyer_id: string
      status: string
      total: number
      currency: string
      created_at: string
      buyer: { username: string | null; full_name: string | null; avatar_url: string | null } | null
    } | null
  }>
}
