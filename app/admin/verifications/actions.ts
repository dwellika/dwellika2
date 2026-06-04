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

// ─── Artist verification ──────────────────────────────────────────────────────

export async function setArtistVerifStatus(
  verificationId: string,
  status: "under_review" | "approved" | "rejected" | "resubmit_requested",
  notes: string,
): Promise<ActionResult> {
  try {
    const adminId = await requireAdmin()
    if (!adminId) return { ok: false, error: "Admins only." }

    const verif = await prisma.artistVerification.update({
      where: { id: verificationId },
      data: {
        status,
        reviewed_by:      adminId,
        reviewed_at:      new Date(),
        admin_notes:      notes || null,
        rejection_reason: status === "rejected" ? (notes || null) : undefined,
      },
      select: { user_id: true },
    })

    if (status === "approved") {
      await Promise.all([
        // Confirm artist role and mark verified
        prisma.user.update({
          where: { id: verif.user_id },
          data:  { role: "artist", is_verified: true },
        }),
        // Mark or create ArtistProfile as verified
        prisma.artistProfile.upsert({
          where:  { id: verif.user_id },
          create: { id: verif.user_id, is_verified: true, verified_at: new Date() },
          update: { is_verified: true, verified_at: new Date() },
        }),
        // Award verified_artist badge if it exists
        prisma.badge
          .findFirst({ where: { slug: "verified_artist" } })
          .then((badge) => {
            if (!badge) return
            return prisma.userBadge.upsert({
              where:  { user_id_badge_id: { user_id: verif.user_id, badge_id: badge.id } },
              create: { user_id: verif.user_id, badge_id: badge.id },
              update: {},
            })
          }),
        // Notify user
        prisma.notification.create({
          data: {
            user_id:    verif.user_id,
            kind:       "system",
            title:      "You are now a verified artist",
            body:       "Your artist verification has been approved. Your profile now shows the verified badge.",
            action_url: "/artist/dashboard",
          },
        }),
      ])
    } else if (status === "rejected" || status === "resubmit_requested") {
      await prisma.notification.create({
        data: {
          user_id:    verif.user_id,
          kind:       "system",
          title:      status === "rejected" ? "Artist verification rejected" : "Artist verification — action required",
          body:       notes || (status === "resubmit_requested" ? "Please resubmit the requested documents." : "Your application was not approved."),
          action_url: "/verify/artist",
        },
      })
    }

    await prisma.moderationLog.create({
      data: {
        admin_id:    adminId,
        action:      `artist_verif:${status}`,
        target_kind: "artist_verification",
        target_id:   verificationId,
        notes:       notes || null,
      },
    })

    revalidatePath("/admin/verifications")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function reviewArtistDoc(
  docId: string,
  status: "approved" | "rejected" | "resubmit",
  notes: string,
): Promise<ActionResult> {
  try {
    const adminId = await requireAdmin()
    if (!adminId) return { ok: false, error: "Admins only." }

    await prisma.artistVerificationDoc.update({
      where: { id: docId },
      data:  { status, notes: notes || null, reviewed_by: adminId, reviewed_at: new Date() },
    })

    revalidatePath("/admin/verifications")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

// ─── Seller verification (re-exported from sellers admin for unified page) ────

export async function reviewSellerDoc(
  docId: string,
  status: "approved" | "rejected" | "resubmit",
  notes: string,
): Promise<ActionResult> {
  try {
    const adminId = await requireAdmin()
    if (!adminId) return { ok: false, error: "Admins only." }

    await prisma.sellerVerificationDoc.update({
      where: { id: docId },
      data:  { status, notes: notes || null, reviewed_by: adminId, reviewed_at: new Date() },
    })

    await prisma.moderationLog.create({
      data: {
        admin_id:    adminId,
        action:      `seller_doc:${status}`,
        target_kind: "verification_doc",
        target_id:   docId,
        notes:       notes || null,
      },
    })

    revalidatePath("/admin/verifications")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function approveSeller(sellerId: string): Promise<ActionResult> {
  try {
    const adminId = await requireAdmin()
    if (!adminId) return { ok: false, error: "Admins only." }

    await Promise.all([
      prisma.sellerProfile.update({
        where: { id: sellerId },
        data:  { is_verified: true, verified_at: new Date(), status: "approved", reviewed_by: adminId, reviewed_at: new Date() },
      }),
      prisma.user.update({
        where: { id: sellerId },
        data:  { role: "seller", is_verified: true },
      }),
    ])

    const badge = await prisma.badge.findFirst({ where: { slug: "verified_seller" } })
    if (badge) {
      await prisma.userBadge.upsert({
        where:  { user_id_badge_id: { user_id: sellerId, badge_id: badge.id } },
        create: { user_id: sellerId, badge_id: badge.id },
        update: {},
      })
    }

    await prisma.notification.create({
      data: {
        user_id:    sellerId,
        kind:       "system",
        title:      "You are now a verified seller",
        body:       "Welcome to the verified circle — your shop now shows the verified badge.",
        action_url: "/seller/dashboard",
      },
    })

    await prisma.moderationLog.create({
      data: {
        admin_id:    adminId,
        action:      "seller_approved",
        target_kind: "seller",
        target_id:   sellerId,
      },
    })

    revalidatePath("/admin/verifications")
    revalidatePath("/admin/sellers")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function setSellerVerifStatus(
  sellerId: string,
  status: "under_review" | "rejected" | "resubmit_requested",
  notes: string,
): Promise<ActionResult> {
  try {
    const adminId = await requireAdmin()
    if (!adminId) return { ok: false, error: "Admins only." }

    await prisma.sellerProfile.update({
      where: { id: sellerId },
      data: {
        status,
        is_verified: false,
        reviewed_by:      adminId,
        reviewed_at:      new Date(),
        admin_notes:      notes || null,
        rejection_reason: status === "rejected" ? (notes || null) : undefined,
      },
    })

    await prisma.notification.create({
      data: {
        user_id:    sellerId,
        kind:       "system",
        title:      status === "rejected" ? "Seller verification rejected" : "Seller verification — action required",
        body:       notes || (status === "resubmit_requested" ? "Please resubmit the requested documents." : "Your application was not approved."),
        action_url: "/verify/seller",
      },
    })

    await prisma.moderationLog.create({
      data: {
        admin_id:    adminId,
        action:      `seller_verif:${status}`,
        target_kind: "seller",
        target_id:   sellerId,
        notes:       notes || null,
      },
    })

    revalidatePath("/admin/verifications")
    revalidatePath("/admin/sellers")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

// ─── Delete artist verification ───────────────────────────────────────────────

export async function deleteArtistVerification(verificationId: string): Promise<ActionResult> {
  try {
    const adminId = await requireAdmin()
    if (!adminId) return { ok: false, error: "Admins only." }

    const verif = await prisma.artistVerification.findUnique({
      where:  { id: verificationId },
      select: { user_id: true },
    })
    if (!verif) return { ok: false, error: "Verification not found." }

    await prisma.artistVerification.delete({ where: { id: verificationId } })

    await prisma.moderationLog.create({
      data: {
        admin_id:    adminId,
        action:      "artist_verif:deleted",
        target_kind: "artist_verification",
        target_id:   verificationId,
      },
    })

    revalidatePath("/admin/verifications")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

// ─── Delete seller verification docs ─────────────────────────────────────────

export async function deleteSellerVerificationDocs(sellerId: string): Promise<ActionResult> {
  try {
    const adminId = await requireAdmin()
    if (!adminId) return { ok: false, error: "Admins only." }

    await prisma.sellerVerificationDoc.deleteMany({ where: { seller_id: sellerId } })

    await prisma.moderationLog.create({
      data: {
        admin_id:    adminId,
        action:      "seller_verif_docs:deleted",
        target_kind: "seller",
        target_id:   sellerId,
      },
    })

    revalidatePath("/admin/verifications")
    revalidatePath("/admin/sellers")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}
