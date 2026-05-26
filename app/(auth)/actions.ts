"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

type ActionResult = { ok: true } | { ok: false; error: string }

async function getOrigin() {
  const h = await headers()
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    h.get("origin") ??
    `https://${h.get("host") ?? "localhost:3000"}`
  )
}

export async function signInWithPassword(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const next = String(formData.get("next") ?? "/")

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { ok: false, error: error.message }

  redirect(next || "/")
}

export async function signUpWithPassword(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const confirm = String(formData.get("confirmPassword") ?? "")
  const fullName = String(formData.get("fullName") ?? "").trim()

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." }
  }
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." }
  }
  if (password !== confirm) {
    return { ok: false, error: "Passwords do not match." }
  }

  const origin = await getOrigin()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/settings/profile`,
      data: { full_name: fullName },
    },
  })

  if (error) return { ok: false, error: error.message }

  return { ok: true }
}

export async function signInWithOAuth(formData: FormData): Promise<ActionResult> {
  const provider = String(formData.get("provider") ?? "") as
    | "google"
    | "github"
    | "apple"
  if (!["google", "github", "apple"].includes(provider)) {
    return { ok: false, error: "Unsupported provider." }
  }

  const supabase = await createClient()
  const origin = await getOrigin()
  const next = String(formData.get("next") ?? "/")

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })

  if (error || !data?.url) {
    return { ok: false, error: error?.message ?? "Could not start OAuth flow." }
  }

  redirect(data.url)
}

export async function requestPasswordReset(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const email = String(formData.get("email") ?? "").trim()
  if (!email) return { ok: false, error: "Email is required." }

  const origin = await getOrigin()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function completePasswordReset(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const password = String(formData.get("password") ?? "")
  const confirm = String(formData.get("confirmPassword") ?? "")

  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." }
  }
  if (password !== confirm) {
    return { ok: false, error: "Passwords do not match." }
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { ok: false, error: error.message }

  redirect("/signin?reset=ok")
}

export async function signOut(): Promise<ActionResult> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}
