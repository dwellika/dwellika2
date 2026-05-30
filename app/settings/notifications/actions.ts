"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import type { NotificationPrefs } from "./types"

type ActionResult = { ok: true } | { ok: false; error: string }

export async function updateNotificationPrefs(
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." }

  const prefs: NotificationPrefs = {
    bell_likes:     formData.get("bell_likes")     === "on",
    bell_comments:  formData.get("bell_comments")  === "on",
    bell_follows:   formData.get("bell_follows")   === "on",
    bell_messages:  formData.get("bell_messages")  === "on",
    bell_orders:    formData.get("bell_orders")    === "on",
    bell_system:    formData.get("bell_system")    === "on",
    email_comments: formData.get("email_comments") === "on",
    email_follows:  formData.get("email_follows")  === "on",
    email_orders:   formData.get("email_orders")   === "on",
    email_system:   formData.get("email_system")   === "on",
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data:  { notification_prefs: prefs as Record<string, boolean> },
  })

  revalidatePath("/settings/notifications")
  return { ok: true }
}
