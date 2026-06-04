"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { z } from "zod"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

type ActionResult = { ok: true } | { ok: false; error: string }

async function requireSuperAdmin() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated." as const }
  if (session.user.role !== "super_admin") return { error: "Super admins only." as const }
  return { userId: session.user.id }
}

const createSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  fullName: z.string().trim().optional(),
  role: z.enum(["admin", "super_admin"]),
})

/** Create a brand-new admin (or super-admin) account with credentials. */
export async function createAdmin(formData: FormData): Promise<ActionResult> {
  const guard = await requireSuperAdmin()
  if ("error" in guard) return { ok: false, error: guard.error }

  const parsed = createSchema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
    fullName: String(formData.get("fullName") ?? "").trim() || undefined,
    role: String(formData.get("role") ?? "admin"),
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input." }
  }
  const { email, password, fullName, role } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (existing) return { ok: false, error: "An account with this email already exists." }

  const password_hash = await bcrypt.hash(password, 12)
  const created = await prisma.user.create({
    data: {
      email,
      password_hash,
      full_name: fullName ?? null,
      role,
      is_verified: true,
      email_verified: new Date(),
    },
    select: { id: true },
  })

  await prisma.moderationLog.create({
    data: {
      admin_id: guard.userId,
      action: `create_admin:${role}`,
      target_kind: "user",
      target_id: created.id,
      notes: email,
    },
  })

  revalidatePath("/admin/admins")
  return { ok: true }
}

/** Revoke an admin's privileges by demoting them to a regular user. */
export async function revokeAdmin(userId: string): Promise<ActionResult> {
  const guard = await requireSuperAdmin()
  if ("error" in guard) return { ok: false, error: guard.error }
  if (userId === guard.userId) return { ok: false, error: "You cannot revoke your own access." }

  await prisma.user.update({ where: { id: userId }, data: { role: "user" } })
  await prisma.moderationLog.create({
    data: {
      admin_id: guard.userId,
      action: "revoke_admin",
      target_kind: "user",
      target_id: userId,
    },
  })

  revalidatePath("/admin/admins")
  return { ok: true }
}

/** Permanently delete an admin account. */
export async function deleteAdmin(userId: string): Promise<ActionResult> {
  const guard = await requireSuperAdmin()
  if ("error" in guard) return { ok: false, error: guard.error }
  if (userId === guard.userId) return { ok: false, error: "You cannot delete your own account here." }

  await prisma.moderationLog.create({
    data: {
      admin_id: guard.userId,
      action: "delete_admin",
      target_kind: "user",
      target_id: userId,
    },
  })
  await prisma.user.delete({ where: { id: userId } })

  revalidatePath("/admin/admins")
  return { ok: true }
}
