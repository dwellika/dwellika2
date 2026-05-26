"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { AppRole } from "@/lib/types/database"

type ActionResult = { ok: true } | { ok: false; error: string }

async function requireSuperAdmin(): Promise<{ supabase: Awaited<ReturnType<typeof createClient>>; userId: string } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated." }
  const { data: p } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()
  const role = (p as { role?: AppRole } | null)?.role
  if (role !== "super_admin") return { error: "Super admins only." }
  return { supabase, userId: user.id }
}

async function requireAdmin(): Promise<{ supabase: Awaited<ReturnType<typeof createClient>>; userId: string; role: AppRole } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated." }
  const { data: p } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()
  const role = (p as { role?: AppRole } | null)?.role
  if (role !== "admin" && role !== "super_admin") return { error: "Admins only." }
  return { supabase, userId: user.id, role }
}

export async function setUserRole(userId: string, role: AppRole): Promise<ActionResult> {
  try {
    const guard = await requireSuperAdmin()
    if ("error" in guard) return { ok: false, error: guard.error }
    const admin = createAdminClient()
    await admin.from("profiles").update({ role }).eq("id", userId)
    await admin.from("moderation_logs").insert({
      admin_id: guard.userId,
      action: `set_role:${role}`,
      target_kind: "user",
      target_id: userId,
    })
    revalidatePath("/admin/users")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function banUser(userId: string, reason: string): Promise<ActionResult> {
  try {
    const guard = await requireAdmin()
    if ("error" in guard) return { ok: false, error: guard.error }
    const admin = createAdminClient()
    // Mark profile (no banned column exists yet — we'll set bio prefix as a soft signal)
    await admin
      .from("profiles")
      .update({ bio: `[BANNED] ${reason}` })
      .eq("id", userId)
    await admin.from("moderation_logs").insert({
      admin_id: guard.userId,
      action: "ban",
      target_kind: "user",
      target_id: userId,
      notes: reason,
    })
    revalidatePath("/admin/users")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}
