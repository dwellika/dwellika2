import "server-only"

import { prisma } from "@/lib/prisma"

export async function listMyDisputes(userId: string) {
  return prisma.dispute.findMany({
    where: { OR: [{ opened_by: userId }, { against_id: userId }] },
    include: {
      order: { select: { order_number: true } },
      opener: { select: { username: true, full_name: true, avatar_url: true } },
      target: { select: { username: true, full_name: true, avatar_url: true } },
    },
    orderBy: { created_at: "desc" },
  })
}

export async function getDispute(disputeId: string, userId: string, isAdmin: boolean) {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      order: { select: { id: true, order_number: true, total: true, currency: true } },
    },
  })
  if (!dispute) return null
  if (!isAdmin && dispute.opened_by !== userId && dispute.against_id !== userId) return null
  return dispute
}

export async function listDisputeMessages(disputeId: string) {
  return prisma.disputeMessage.findMany({
    where: { dispute_id: disputeId },
    include: {
      sender: { select: { id: true, username: true, full_name: true, avatar_url: true } },
    },
    orderBy: { created_at: "asc" },
  })
}
