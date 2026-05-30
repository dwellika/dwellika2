"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import type { AppRole } from "@/lib/types/database"

type ActionResult = { ok: true } | { ok: false; error: string }

async function requireSuperAdmin() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated." }
  if (session.user.role !== "super_admin") return { error: "Super admins only." }
  return { userId: session.user.id }
}

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated." }
  const role = session.user.role ?? "user"
  if (role !== "admin" && role !== "super_admin") return { error: "Admins only." }
  return { userId: session.user.id, role }
}

// ─── Role change (super_admin only) ──────────────────────────────────────────

export async function setUserRole(userId: string, role: AppRole): Promise<ActionResult> {
  try {
    const guard = await requireSuperAdmin()
    if ("error" in guard) return { ok: false, error: guard.error as string }

    await prisma.user.update({ where: { id: userId }, data: { role } })
    await prisma.moderationLog.create({
      data: {
        admin_id:    guard.userId as string,
        action:      `set_role:${role}`,
        target_kind: "user",
        target_id:   userId,
      },
    })
    revalidatePath("/admin/users")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

// ─── Suspend (admin+) ─────────────────────────────────────────────────────────

export async function suspendUser(
  userId: string,
  days: number,
  reason: string,
): Promise<ActionResult> {
  try {
    const guard = await requireAdmin()
    if ("error" in guard) return { ok: false, error: guard.error as string }
    if (!reason.trim()) return { ok: false, error: "Reason is required." }

    const until = days === 0
      ? new Date("9999-12-31")                                    // permanent
      : new Date(Date.now() + days * 24 * 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: userId },
      data:  { suspended_until: until },
    })
    await prisma.moderationLog.create({
      data: {
        admin_id:    guard.userId as string,
        action:      days === 0 ? "suspend:permanent" : `suspend:${days}d`,
        target_kind: "user",
        target_id:   userId,
        notes:       reason,
      },
    })
    await prisma.notification.create({
      data: {
        user_id:    userId,
        kind:       "system",
        title:      days === 0 ? "Account permanently suspended" : `Account suspended for ${days} day(s)`,
        body:       reason,
        action_url: null,
      },
    })
    revalidatePath("/admin/users")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function unsuspendUser(userId: string): Promise<ActionResult> {
  try {
    const guard = await requireAdmin()
    if ("error" in guard) return { ok: false, error: guard.error as string }

    await prisma.user.update({ where: { id: userId }, data: { suspended_until: null } })
    await prisma.moderationLog.create({
      data: {
        admin_id:    guard.userId as string,
        action:      "unsuspend",
        target_kind: "user",
        target_id:   userId,
      },
    })
    revalidatePath("/admin/users")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

// ─── Ban note (marks bio, admin+) ────────────────────────────────────────────

export async function banUser(userId: string, reason: string): Promise<ActionResult> {
  try {
    const guard = await requireAdmin()
    if ("error" in guard) return { ok: false, error: guard.error as string }
    if (!reason.trim()) return { ok: false, error: "Reason is required." }

    await prisma.user.update({
      where: { id: userId },
      data:  { bio: `[BANNED] ${reason}`, suspended_until: new Date("9999-12-31") },
    })
    await prisma.moderationLog.create({
      data: {
        admin_id:    guard.userId as string,
        action:      "ban",
        target_kind: "user",
        target_id:   userId,
        notes:       reason,
      },
    })
    revalidatePath("/admin/users")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

// ─── Hard delete (super_admin only) ──────────────────────────────────────────

export async function deleteUser(userId: string, reason: string): Promise<ActionResult> {
  try {
    const guard = await requireSuperAdmin()
    if ("error" in guard) return { ok: false, error: guard.error as string }
    if (!reason.trim()) return { ok: false, error: "Reason is required." }

    // Log before deletion so the record exists
    await prisma.moderationLog.create({
      data: {
        admin_id:    guard.userId as string,
        action:      "delete_user",
        target_kind: "user",
        target_id:   userId,
        notes:       reason,
        before_state: { userId },
      },
    })

    await prisma.user.delete({ where: { id: userId } })

    revalidatePath("/admin/users")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}
