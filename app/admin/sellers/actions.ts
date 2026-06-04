"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

type ActionResult = { ok: true } | { ok: false; error: string }

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  const role = session.user.role as string | undefined
  if (role !== "admin" && role !== "super_admin") return null
  return session.user.id
}

export async function reviewVerificationDoc(
  docId: string,
  status: "approved" | "rejected" | "resubmit",
  notes: string,
): Promise<ActionResult> {
  try {
    const adminId = await requireAdmin()
    if (!adminId) return { ok: false, error: "Admins only." }

    await prisma.sellerVerificationDoc.update({
      where: { id: docId },
      data: {
        status,
        notes: notes || null,
        reviewed_by: adminId,
        reviewed_at: new Date(),
      },
    })

    await prisma.moderationLog.create({
      data: {
        admin_id: adminId,
        action: `verification:${status}`,
        target_kind: "verification_doc",
        target_id: docId,
        notes,
      },
    })

    revalidatePath("/admin/sellers")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function approveSeller(sellerId: string): Promise<ActionResult> {
  try {
    const adminId = await requireAdmin()
    if (!adminId) return { ok: false, error: "Admins only." }

    await prisma.sellerProfile.update({
      where: { id: sellerId },
      data: { is_verified: true, verified_at: new Date(), status: "approved", reviewed_by: adminId, reviewed_at: new Date() },
    })
    await prisma.user.update({
      where: { id: sellerId },
      data: { role: "seller", is_verified: true },
    })

    const badge = await prisma.badge.findFirst({ where: { slug: "verified_seller" } })
    if (badge) {
      await prisma.userBadge.upsert({
        where: { user_id_badge_id: { user_id: sellerId, badge_id: badge.id } },
        create: { user_id: sellerId, badge_id: badge.id },
        update: {},
      })
    }

    await prisma.notification.create({
      data: {
        user_id: sellerId,
        kind: "system",
        title: "You are now a verified seller",
        body: "Welcome to the verified circle — your shop now shows the verified badge.",
        action_url: "/seller/dashboard",
      },
    })

    await prisma.moderationLog.create({
      data: {
        admin_id: adminId,
        action: "seller_approved",
        target_kind: "seller",
        target_id: sellerId,
      },
    })

    revalidatePath("/admin/sellers")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}
