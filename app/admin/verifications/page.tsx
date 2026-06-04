import Link from "next/link"
import { CheckCircle2, FileText } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { requireRole } from "@/lib/auth/rbac"
import { prisma } from "@/lib/prisma"

import {
  ApproveSellerButton,
  ArtistVerifControls,
  DeleteArtistVerifButton,
  DeleteSellerDocsButton,
  RejectSellerControls,
  ReviewArtistDocControls,
  ReviewSellerDocControls,
} from "./Controls"

export const metadata = { title: "Admin · Verifications" }

const STATUS_TONE: Record<string, string> = {
  draft:               "bg-muted text-muted-foreground",
  submitted:           "bg-blue-500/20 text-blue-300",
  under_review:        "bg-amber-500/20 text-amber-300",
  approved:            "bg-emerald-500/20 text-emerald-300",
  rejected:            "bg-red-500/20 text-red-300",
  resubmit_requested:  "bg-orange-500/20 text-orange-300",
  pending:             "bg-amber-500/20 text-amber-300",
  resubmit:            "bg-orange-500/20 text-orange-300",
}

export default async function AdminVerificationsPage() {
  await requireRole("admin", "super_admin")

  // ── Fetch artist verifications ─────────────────────────────────────────────
  const artistVerifs = await prisma.artistVerification.findMany({
    where: { status: { not: "draft" } },
    include: {
      user: { select: { id: true, username: true, full_name: true, avatar_url: true, email: true } },
      docs: { select: { id: true, doc_kind: true, file_url: true, status: true, notes: true, created_at: true }, orderBy: { created_at: "desc" } },
    },
    orderBy: { submitted_at: "desc" },
  })

  // ── Fetch seller docs (grouped) ────────────────────────────────────────────
  const sellerDocs = await prisma.sellerVerificationDoc.findMany({
    select: {
      id: true, seller_id: true, doc_kind: true, file_url: true, status: true,
      notes: true, reviewed_at: true, created_at: true,
      seller: { select: { id: true, username: true, full_name: true, avatar_url: true } },
    },
    orderBy: { created_at: "desc" },
  })

  const sellerIds   = [...new Set(sellerDocs.map((d) => d.seller_id))]
  const sellerProfs = await prisma.sellerProfile.findMany({
    where:  { id: { in: sellerIds } },
    select: { id: true, business_name: true, is_verified: true },
  })
  const spMap = new Map(sellerProfs.map((s) => [s.id, s]))

  const sellerGrouped = new Map<string, typeof sellerDocs>()
  for (const d of sellerDocs) {
    if (!sellerGrouped.has(d.seller_id)) sellerGrouped.set(d.seller_id, [])
    sellerGrouped.get(d.seller_id)!.push(d)
  }

  const pendingArtists = artistVerifs.filter((v) => v.status !== "approved" && v.status !== "rejected").length
  const pendingSellers = sellerDocs.filter((d) => d.status === "pending").length

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl">Verifications</h1>
        <p className="mt-1 text-muted-foreground">
          Review artist and seller verification requests.
        </p>
      </header>

      <Tabs defaultValue="artists">
        <TabsList>
          <TabsTrigger value="artists">
            Artists
            {pendingArtists > 0 && (
              <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                {pendingArtists}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sellers">
            Sellers
            {pendingSellers > 0 && (
              <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                {pendingSellers}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Artists tab ── */}
        <TabsContent value="artists" className="mt-4 space-y-4">
          {artistVerifs.length === 0 ? (
            <Empty label="No artist verification requests yet." />
          ) : null}

          {artistVerifs.map((v) => {
            const name = v.user.full_name ?? `@${v.user.username}`
            return (
              <Card key={v.id}>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarImage src={v.user.avatar_url ?? undefined} />
                      <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">
                        <Link href={`/u/${v.user.username}`} className="hover:underline">{name}</Link>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">@{v.user.username} · {v.user.email}</p>
                      {v.mobile && <p className="text-xs text-muted-foreground">📱 {v.mobile}</p>}
                      {v.instagram_url && (
                        <a href={v.instagram_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                          Instagram ↗
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <Badge className={`capitalize ${STATUS_TONE[v.status] ?? ""}`}>
                      {v.status.replace("_", " ")}
                    </Badge>
                    {v.submitted_at && (
                      <p className="text-xs text-muted-foreground">
                        Submitted {new Date(v.submitted_at).toLocaleDateString()}
                      </p>
                    )}
                    {v.admin_notes && (
                      <p className="max-w-xs text-xs text-muted-foreground">{v.admin_notes}</p>
                    )}
                  </div>
                </CardHeader>

                {/* Documents */}
                {v.docs.length > 0 && (
                  <CardContent className="divide-y divide-border p-0">
                    {v.docs.map((d) => (
                      <div key={d.id} className="grid items-center gap-3 p-4 md:grid-cols-[140px_minmax(0,1fr)_100px_260px]">
                        <p className="text-sm capitalize">{d.doc_kind.replace(/_/g, " ")}</p>
                        <a href={d.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 truncate text-xs text-primary hover:underline">
                          <FileText className="size-3 shrink-0" /> View document
                        </a>
                        <Badge className={`capitalize text-[10px] ${STATUS_TONE[d.status] ?? ""}`}>{d.status}</Badge>
                        <ReviewArtistDocControls docId={d.id} currentStatus={d.status} />
                      </div>
                    ))}
                  </CardContent>
                )}

                {/* Overall approval controls + delete */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
                  <ArtistVerifControls verificationId={v.id} currentStatus={v.status} />
                  <DeleteArtistVerifButton verificationId={v.id} />
                </div>
              </Card>
            )
          })}
        </TabsContent>

        {/* ── Sellers tab ── */}
        <TabsContent value="sellers" className="mt-4 space-y-4">
          {sellerGrouped.size === 0 ? (
            <Empty label="No seller verification submissions yet." />
          ) : null}

          {Array.from(sellerGrouped.entries()).map(([sellerId, list]) => {
            const seller = list[0]?.seller
            const sp = spMap.get(sellerId)
            const name = sp?.business_name ?? seller?.full_name ?? `@${seller?.username}`
            return (
              <Card key={sellerId}>
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarImage src={seller?.avatar_url ?? undefined} />
                      <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">
                        <Link href={`/u/${seller?.username}`} className="hover:underline">{name}</Link>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">@{seller?.username}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <ApproveSellerButton sellerId={sellerId} disabled={Boolean(sp?.is_verified)} />
                    {!sp?.is_verified ? <RejectSellerControls sellerId={sellerId} /> : null}
                    <DeleteSellerDocsButton sellerId={sellerId} />
                  </div>
                </CardHeader>
                <CardContent className="divide-y divide-border p-0">
                  {list.map((d) => (
                    <div key={d.id} className="grid items-center gap-3 p-4 md:grid-cols-[140px_minmax(0,1fr)_100px_260px]">
                      <p className="text-sm capitalize">{d.doc_kind.replace(/_/g, " ")}</p>
                      <a href={d.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 truncate text-xs text-primary hover:underline">
                        <FileText className="size-3 shrink-0" /> View document
                      </a>
                      <Badge className={`capitalize text-[10px] ${STATUS_TONE[d.status] ?? ""}`}>{d.status}</Badge>
                      <ReviewSellerDocControls docId={d.id} currentStatus={d.status} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Empty({ label }: { label: string }) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <CheckCircle2 className="mx-auto size-10 text-muted-foreground" />
        <p className="mt-3 font-display text-xl">{label}</p>
      </CardContent>
    </Card>
  )
}
