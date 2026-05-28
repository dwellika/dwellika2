import "server-only"

import { prisma } from "@/lib/prisma"

export async function listMyOrders(userId: string) {
  return prisma.order.findMany({
    where: { buyer_id: userId },
    include: {
      order_items: true,
    },
    orderBy: { created_at: "desc" },
  })
}

export async function getOrderById(orderId: string, userId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      order_items: true,
      order_tracking_events: { orderBy: { occurred_at: "desc" } },
    },
  })
  if (!order) return null

  if (order.buyer_id !== userId) {
    const isSeller = order.order_items.some((oi) => oi.seller_id === userId)
    if (!isSeller) return null
  }

  return order
}

export async function listSellerOrders(sellerId: string) {
  const items = await prisma.orderItem.findMany({
    where: { seller_id: sellerId },
    include: {
      order: {
        include: {
          buyer: {
            select: { username: true, full_name: true, avatar_url: true },
          },
        },
      },
    },
    orderBy: { id: "desc" },
  })

  return items
}
