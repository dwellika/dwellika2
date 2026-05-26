import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requireRole } from "@/lib/auth/rbac"
import { createAdminClient } from "@/lib/supabase/admin"

import { ApproveSellerButton, ReviewDocControls } from "./Controls"

export const metadata = { title: "Admin · Seller verifications" }

const STATUS_TONE: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-300",
  approved: "bg-emerald-500/20 text-emerald-300",
  rejected: "bg-red-500/20 text-red-300",
  resubmit: "bg-orange-500/20 text-orange-300",
}

export default async function AdminSellersPage() {
  await requireRole("admin", "super_admin")
  const admin = createAdminClient()

  const { data } = await admin
    .from("seller_verification_docs")
    .select(
      `
        id, seller_id, doc_kind, storage_path, status, notes, reviewed_at, created_at,
        seller:profiles!seller_verification_docs_seller_id_fkey ( id, username, full_name, avatar_url ),
        sp:seller_profiles!seller_verification_docs_seller_id_fkey ( business_name, is_verified )
      `,
    )
    .order("created_at", { ascending: false })

  const docs =
    (data ?? []) as unknown as Array<{
      id: string
      seller_id: string
      doc_kind: string
      storage_path: string
      status: string
      notes: string | null
      reviewed_at: string | null
      created_at: string
      seller: { id: string; username: string | null; full_name: string | null; avatar_url: string | null } | null
      sp: { business_name: string; is_verified: boolean } | null
    }>

  // Group by seller
  const grouped = new Map<string, typeof docs>()
  for (const d of docs) {
    const k = d.seller_id
    if (!grouped.has(k)) grouped.set(k, [])
    grouped.get(k)!.push(d)
  }

  // Resolve signed URLs (60 minutes) so docs are previewable
  for (const list of grouped.values()) {
    await Promise.all(
      list.map(async (d) => {
        const { data: signed } = await admin.storage
          .from("verification")
          .createSignedUrl(d.storage_path, 60 * 60)
        ;(d as { signed_url?: string }).signed_url = signed?.signedUrl ?? ""
      }),
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl">Seller verifications</h1>
        <p className="mt-1 text-muted-foreground">
          Approve or reject document submissions. Approving the seller awards the
          verified-seller badge.
        </p>
      </header>

      {grouped.size === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="mx-auto size-10 text-muted-foreground" />
            <p className="mt-3 font-display text-xl">No submissions waiting</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Verifications appear here as sellers submit their documents.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {Array.from(grouped.entries()).map(([sellerId, list]) => {
        const seller = list[0]?.seller
        const sp = list[0]?.sp
        return (
          <Card key={sellerId}>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarImage src={seller?.avatar_url ?? undefined} />
                  <AvatarFallback>{(seller?.full_name ?? seller?.username ?? "?").slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">
                    <Link href={`/u/${seller?.username}`} className="hover:underline">
                      {sp?.business_name ?? seller?.full_name ?? `@${seller?.username}`}
                    </Link>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">@{seller?.username}</p>
                </div>
              </div>
              <ApproveSellerButton sellerId={sellerId} disabled={Boolean(sp?.is_verified)} />
            </CardHeader>
            <CardContent className="divide-y divide-border p-0">
              {list.map((d) => (
                <div key={d.id} className="grid items-center gap-3 p-4 md:grid-cols-[140px_minmax(0,1fr)_140px_240px]">
                  <p className="text-sm capitalize">{d.doc_kind.replace("_", " ")}</p>
                  <a
                    href={(d as { signed_url?: string }).signed_url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-xs text-primary hover:underline"
                  >
                    {d.storage_path.split("/").pop()}
                  </a>
                  <Badge className={`capitalize ${STATUS_TONE[d.status] ?? ""}`}>{d.status}</Badge>
                  <ReviewDocControls docId={d.id} currentStatus={d.status} />
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
