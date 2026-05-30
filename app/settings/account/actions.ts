"use server"

import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"

import { auth, signOut } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

type ActionResult = { ok: true } | { ok: false; error: string }

export async function updateEmail(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." }

  const email    = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email address." }
  }

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { password_hash: true },
  })

  if (user?.password_hash) {
    if (!password) return { ok: false, error: "Enter your current password to confirm." }
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return { ok: false, error: "Incorrect password." }
  }

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (existing && existing.id !== session.user.id) {
    return { ok: false, error: "That email is already in use." }
  }

  await prisma.user.update({ where: { id: session.user.id }, data: { email } })
  return { ok: true }
}

export async function deleteAccount(formData: FormData): Promise<ActionResult | void> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." }

  const confirmation = String(formData.get("confirmation") ?? "").trim()
  const password     = String(formData.get("password") ?? "")
  const expectedPhrase = "delete my account"

  if (confirmation.toLowerCase() !== expectedPhrase) {
    return { ok: false, error: `Type "${expectedPhrase}" exactly to confirm.` }
  }

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { password_hash: true },
  })

  if (user?.password_hash) {
    if (!password) return { ok: false, error: "Enter your password to confirm." }
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return { ok: false, error: "Incorrect password." }
  }

  await prisma.user.delete({ where: { id: session.user.id } })
  await signOut({ redirect: false })
  redirect("/")
}
