"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

type Surface = "artworks" | "reels" | "community_posts" | "competition_submissions"
type Decision = "approved" | "rejected" | "hidden"

type ActionResult = { ok: true } | { ok: false; error: string }

const SURFACES: Surface[] = ["artworks", "reels", "community_posts", "competition_submissions"]

export async function moderate(
  surface: Surface,
  ids: string[],
  decision: Decision,
  notes: string,
): Promise<ActionResult> {
  try {
    if (!SURFACES.includes(surface)) return { ok: false, error: "Invalid surface." }
    if (ids.length === 0) return { ok: false, error: "Select at least one item." }
    if (decision !== "approved" && !notes.trim()) {
      return { ok: false, error: "Notes are required when rejecting or hiding." }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: "Not authenticated." }
    const { data: p } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()
    const role = (p as { role?: string } | null)?.role
    if (role !== "admin" && role !== "super_admin") {
      return { ok: false, error: "Admins only." }
    }

    const admin = createAdminClient()
    await admin
      .from(surface)
      .update({ status: decision })
      .in("id", ids)

    const logs = ids.map((id) => ({
      admin_id: user.id,
      action: `moderate:${decision}`,
      target_kind: surface,
      target_id: id,
      notes: notes || null,
    }))
    await admin.from("moderation_logs").insert(logs)

    revalidatePath("/admin/moderation")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}
