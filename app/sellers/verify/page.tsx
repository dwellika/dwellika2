import { redirect } from "next/navigation"
import { Shield } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { requireAuth } from "@/lib/auth/rbac"
import { prisma } from "@/lib/prisma"

import { VerifyForm } from "./VerifyForm"

export const metadata = { title: "Seller verification" }

export default async function VerifyPage() {
  const user = await requireAuth()

  const [sellerProfile, docs] = await Promise.all([
    prisma.sellerProfile.findUnique({
      where: { id: user.id },
      select: {
        business_name: true,
        legal_name: true,
        gst_number: true,
        pan_number: true,
        is_verified: true,
        address: true,
        bank_details: true,
      },
    }),
    prisma.sellerVerificationDoc.findMany({
      where: { seller_id: user.id },
      select: { id: true, doc_kind: true, status: true, notes: true, created_at: true, reviewed_at: true },
      orderBy: { created_at: "desc" },
    }),
  ])

  const sp = sellerProfile as {
    business_name: string
    legal_name: string | null
    gst_number: string | null
    pan_number: string | null
    is_verified: boolean
    address: Record<string, string | null> | null
    bank_details: Record<string, string | null> | null
  } | null

  if (sp?.is_verified) {
    redirect("/seller/dashboard?verified=1")
  }

  const verificationDocs = docs.map((d) => ({
    ...d,
    created_at: d.created_at.toISOString(),
    reviewed_at: d.reviewed_at?.toISOString() ?? null,
  }))

  const latestByKind = new Map<string, (typeof verificationDocs)[number]>()
  for (const d of verificationDocs) {
    if (!latestByKind.has(d.doc_kind)) latestByKind.set(d.doc_kind, d)
  }

  return (
    <div className="container-page py-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Become a verified seller</p>
        <h1 className="font-display text-4xl">Seller verification</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          We verify every seller to keep Dwellika trustworthy. Your documents are
          private and only visible to our team.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Business & documents</CardTitle>
            <CardDescription>
              Required: PAN, Aadhaar, and address proof. GST and bank details
              required only for sellers turnover &gt; ₹40L/year.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VerifyForm
              defaults={{
                business_name: sp?.business_name ?? "",
                legal_name: sp?.legal_name ?? "",
                gst_number: sp?.gst_number ?? "",
                pan_number: sp?.pan_number ?? "",
                address: {
                  line1: String(sp?.address?.line1 ?? ""),
                  line2: String(sp?.address?.line2 ?? ""),
                  city: String(sp?.address?.city ?? ""),
                  state: String(sp?.address?.state ?? ""),
                  postal_code: String(sp?.address?.postal_code ?? ""),
                  country: String(sp?.address?.country ?? "IN"),
                },
                bank: {
                  account_holder: String(sp?.bank_details?.account_holder ?? ""),
                  account_number: String(sp?.bank_details?.account_number ?? ""),
                  ifsc: String(sp?.bank_details?.ifsc ?? ""),
                },
              }}
              docsState={Array.from(latestByKind.values())}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <Shield className="size-5 text-primary" /> Why we ask
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Verified sellers get the verified-seller badge, priority
              placement in shop, and full marketplace tooling.
            </p>
            <p>
              Documents are stored securely and only visible to the Dwellika team.
            </p>
            <p>
              Review takes 1-3 business days. We&apos;ll notify you here and via
              email when the decision is made.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
