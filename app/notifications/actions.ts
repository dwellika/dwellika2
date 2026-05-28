"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export async function markNotificationRead(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { ok: false as const, error: "Not authenticated" }
  await prisma.notification.updateMany({
    where: { id, user_id: session.user.id },
    data: { read_at: new Date() },
  })
  revalidatePath("/notifications")
  return { ok: true as const }
}

export async function markAllNotificationsRead() {
  const session = await auth()
  if (!session?.user?.id) return { ok: false as const, error: "Not authenticated" }
  await prisma.notification.updateMany({
    where: { user_id: session.user.id, read_at: null },
    data: { read_at: new Date() },
  })
  revalidatePath("/notifications")
  return { ok: true as const }
}
