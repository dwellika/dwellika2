import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { ProfileRow } from "./types"
import type { DisputeStatus } from "@/lib/types/database"

export interface DisputeRow {
  id: string
  order_id: string
  opened_by: string
  against_id: string
  reason: string
  description: string | null
  evidence: Array<{ url: string; name: string }>
  status: DisputeStatus
  resolution: string | null
  resolved_by: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

export interface DisputeMessageRow {
  id: string
  dispute_id: string
  sender_id: string
  body: string
  attachments: Array<{ url: string; name: string }>
  created_at: string
  sender?: Pick<ProfileRow, "id" | "username" | "full_name" | "avatar_url"> | null
}

export async function listMyDisputes(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("disputes")
    .select(
      `
        id, order_id, opened_by, against_id, reason, description, evidence,
        status, resolution, resolved_by, resolved_at, created_at, updated_at,
        order:orders!disputes_order_id_fkey ( order_number ),
        opener:profiles!disputes_opened_by_fkey ( username, full_name, avatar_url ),
        against:profiles!disputes_against_id_fkey ( username, full_name, avatar_url )
      `,
    )
    .or(`opened_by.eq.${userId},against_id.eq.${userId}`)
    .order("created_at", { ascending: false })
  return (data ?? []) as unknown as Array<
    DisputeRow & {
      order: { order_number: string } | null
      opener: Pick<ProfileRow, "username" | "full_name" | "avatar_url"> | null
      against: Pick<ProfileRow, "username" | "full_name" | "avatar_url"> | null
    }
  >
}

export async function getDispute(disputeId: string, userId: string, isAdmin: boolean) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("disputes")
    .select(
      `
        id, order_id, opened_by, against_id, reason, description, evidence,
        status, resolution, resolved_by, resolved_at, created_at, updated_at,
        order:orders!disputes_order_id_fkey ( id, order_number, total, currency )
      `,
    )
    .eq("id", disputeId)
    .maybeSingle()
  const dispute = data as unknown as
    | (DisputeRow & {
        order: { id: string; order_number: string; total: number; currency: string } | null
      })
    | null
  if (!dispute) return null
  if (
    !isAdmin &&
    dispute.opened_by !== userId &&
    dispute.against_id !== userId
  ) {
    return null
  }
  return dispute
}

export async function listDisputeMessages(disputeId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("dispute_messages")
    .select(
      `
        id, dispute_id, sender_id, body, attachments, created_at,
        sender:profiles!dispute_messages_sender_id_fkey ( id, username, full_name, avatar_url )
      `,
    )
    .eq("dispute_id", disputeId)
    .order("created_at", { ascending: true })
  return (data ?? []) as unknown as DisputeMessageRow[]
}
