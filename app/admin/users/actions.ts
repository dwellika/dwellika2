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

export async function setUserRole(userId: string, role: AppRole): Promise<ActionResult> {
  try {
    const guard = await requireSuperAdmin()
    if ("error" in guard) return { ok: false, error: guard.error as string }

    await prisma.user.update({ where: { id: userId }, data: { role } })
    await prisma.moderationLog.create({
      data: {
        admin_id: guard.userId as string,
        action: `set_role:${role}`,
        target_kind: "user",
        target_id: userId,
      },
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
    if ("error" in guard) return { ok: false, error: guard.error as string }

    await prisma.user.update({
      where: { id: userId },
      data: { bio: `[BANNED] ${reason}` },
    })
    await prisma.moderationLog.create({
      data: {
        admin_id: guard.userId as string,
        action: "ban",
        target_kind: "user",
        target_id: userId,
        notes: reason,
      },
    })
    revalidatePath("/admin/users")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}
