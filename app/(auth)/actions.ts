"use server"

import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { signIn, signOut } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { AuthError } from "next-auth"

type ActionResult = { ok: true } | { ok: false; error: string }

export async function signInWithPassword(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const next = String(formData.get("next") ?? "/")

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." }
  }

  try {
    await signIn("credentials", { email, password, redirect: false })
  } catch (e) {
    if (e instanceof AuthError) {
      return { ok: false, error: "Invalid email or password." }
    }
    throw e
  }

  redirect(next || "/")
}

export async function signUpWithPassword(formData: FormData): Promise<ActionResult> {
  const schema = z.object({
    email: z.string().email("Invalid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
    fullName: z.string().optional(),
  })

  const raw = {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    fullName: String(formData.get("fullName") ?? "").trim() || undefined,
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input." }
  }

  const { email, password, confirmPassword, fullName } = parsed.data
  if (password !== confirmPassword) {
    return { ok: false, error: "Passwords do not match." }
  }

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (existing) {
    return { ok: false, error: "An account with this email already exists." }
  }

  const password_hash = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: {
      email,
      password_hash,
      full_name: fullName ?? null,
    },
  })

  try {
    await signIn("credentials", { email, password, redirect: false })
  } catch {
    // User created; they can sign in
  }

  redirect("/settings/profile?welcome=1")
}

export async function signInWithOAuth(formData: FormData): Promise<ActionResult> {
  const provider = String(formData.get("provider") ?? "") as "google" | "github"
  if (!["google", "github"].includes(provider)) {
    return { ok: false, error: "Unsupported provider." }
  }
  const next = String(formData.get("next") ?? "/")

  await signIn(provider, { redirectTo: next || "/" })
  return { ok: true }
}

export async function requestPasswordReset(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim()
  if (!email) return { ok: false, error: "Email is required." }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (!user) {
    return { ok: true }
  }

  const token = crypto.randomUUID()
  const expires = new Date(Date.now() + 1000 * 60 * 60)

  await prisma.verificationToken.upsert({
    where: { identifier_token: { identifier: email, token } },
    create: { identifier: email, token, expires },
    update: { expires },
  })

  // TODO: send email with reset link containing token
  // In production: integrate with Resend / SendGrid / Nodemailer
  // Reset URL: /reset-password?token=<token>&email=<email>

  return { ok: true }
}

export async function completePasswordReset(formData: FormData): Promise<ActionResult> {
  const token = String(formData.get("token") ?? "")
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const confirm = String(formData.get("confirmPassword") ?? "")

  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." }
  }
  if (password !== confirm) {
    return { ok: false, error: "Passwords do not match." }
  }

  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token } },
  })
  if (!record || record.expires < new Date()) {
    return { ok: false, error: "Reset link is invalid or has expired." }
  }

  const password_hash = await bcrypt.hash(password, 12)
  await prisma.user.update({ where: { email }, data: { password_hash } })
  await prisma.verificationToken.delete({ where: { identifier_token: { identifier: email, token } } })

  redirect("/signin?reset=ok")
}

export async function signOutAction(): Promise<ActionResult> {
  await signOut({ redirect: false })
  redirect("/")
}
