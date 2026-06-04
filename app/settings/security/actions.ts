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

export async function getTwoFactorState(): Promise<{ enabled: boolean }> {
  const session = await auth()
  if (!session?.user?.id) return { enabled: false }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { two_factor_enabled: true },
  })
  return { enabled: Boolean(user?.two_factor_enabled) }
}

export async function setTwoFactor(enabled: boolean): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." }

  // Require a password to be set before enabling email-based 2FA.
  if (enabled) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password_hash: true },
    })
    if (!user?.password_hash) {
      return { ok: false, error: "Set a password first, then enable two-factor authentication." }
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { two_factor_enabled: enabled },
  })
  revalidatePath("/settings/security")
  return { ok: true }
}
