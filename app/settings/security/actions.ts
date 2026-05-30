"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

type ActionResult = { ok: true } | { ok: false; error: string }

export async function changePassword(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." }

  const current    = String(formData.get("current_password") ?? "")
  const next       = String(formData.get("new_password") ?? "")
  const confirm    = String(formData.get("confirm_password") ?? "")

  if (next.length < 8) return { ok: false, error: "New password must be at least 8 characters." }
  if (next !== confirm)  return { ok: false, error: "Passwords do not match." }

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { password_hash: true },
  })

  if (user?.password_hash) {
    if (!current) return { ok: false, error: "Current password is required." }
    const valid = await bcrypt.compare(current, user.password_hash)
    if (!valid) return { ok: false, error: "Current password is incorrect." }
  }

  const hash = await bcrypt.hash(next, 12)
  await prisma.user.update({ where: { id: session.user.id }, data: { password_hash: hash } })
  revalidatePath("/settings/security")
  return { ok: true }
}
