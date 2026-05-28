import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requireRole } from "@/lib/auth/rbac"
import { prisma } from "@/lib/prisma"

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

  const docs = await prisma.sellerVerificationDoc.findMany({
    select: {
      id: true,
      seller_id: true,
      doc_kind: true,
      file_url: true,
      status: true,
      notes: true,
      reviewed_at: true,
      created_at: true,
      seller: {
        select: { id: true, username: true, full_name: true, avatar_url: true },
      },
    },
    orderBy: { created_at: "desc" },
  })

  const sellerIds = [...new Set(docs.map((d) => d.seller_id))]
  const sellerProfiles = await prisma.sellerProfile.findMany({
    where: { id: { in: sellerIds } },
    select: { id: true, business_name: true, is_verified: true },
  })
  const spMap = new Map(sellerProfiles.map((s) => [s.id, s]))

  const grouped = new Map<string, typeof docs>()
  for (const d of docs) {
    if (!grouped.has(d.seller_id)) grouped.set(d.seller_id, [])
    grouped.get(d.seller_id)!.push(d)
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
        const sp = spMap.get(sellerId)
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
                    href={d.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-xs text-primary hover:underline"
                  >
                    {d.doc_kind}
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
