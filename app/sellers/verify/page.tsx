import { redirect } from "next/navigation"
import { Shield } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { requireAuth } from "@/lib/auth/rbac"
import { prisma } from "@/lib/prisma"

import { VerifyForm } from "./VerifyForm"

export const metadata = { title: "Seller verification" }

export default async function VerifyPage() {
  const user = await requireAuth("/signin?next=/sellers/verify")

  const [sellerProfile, docs] = await Promise.all([
    prisma.sellerProfile.findUnique({
      where:  { id: user.id },
      select: {
        business_name: true,
        legal_name:    true,
        gst_number:    true,
        pan_number:    true,
        is_verified:   true,
        address:       true,
        shop_address:  true,
        bank_details:  true,
        mobile:        true,
        website:       true,
        socials:       true,
      },
    }),
    prisma.sellerVerificationDoc.findMany({
      where:   { seller_id: user.id },
      select:  { id: true, doc_kind: true, status: true, notes: true, created_at: true, reviewed_at: true },
      orderBy: { created_at: "desc" },
    }),
  ])

  if (sellerProfile?.is_verified) {
    redirect("/seller/dashboard?verified=1")
  }

  type JsonObj = Record<string, string | null>
  const sp = sellerProfile as typeof sellerProfile & {
    address:      JsonObj | null
    shop_address: JsonObj | null
    bank_details: JsonObj | null
    socials:      JsonObj | null
  } | null

  const verificationDocs = docs.map((d) => ({
    ...d,
    created_at:  d.created_at.toISOString(),
    reviewed_at: d.reviewed_at?.toISOString() ?? null,
  }))

  const latestByKind = new Map<string, (typeof verificationDocs)[number]>()
  for (const d of verificationDocs) {
    if (!latestByKind.has(d.doc_kind)) latestByKind.set(d.doc_kind, d)
  }

  return (
    <div className="container-page pb-12 pt-16 sm:pt-20">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Become a verified seller</p>
        <h1 className="font-display text-4xl">Seller verification</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          We verify every seller to keep Dwellika trustworthy. Your documents are
          private and only visible to our team.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Business & documents</CardTitle>
            <CardDescription>
              Required: PAN, Aadhaar, and address proof. GST and bank details
              required only for sellers with turnover &gt; ₹40L/year.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VerifyForm
              defaults={{
                full_name:    user.full_name ?? "",
                email:        user.email ?? "",
                username:     user.username ?? "",
                mobile:       sp?.mobile ?? "",
                business_name: sp?.business_name ?? "",
                legal_name:   sp?.legal_name ?? "",
                gst_number:   sp?.gst_number ?? "",
                pan_number:   sp?.pan_number ?? "",
                website:      sp?.website ?? "",
                socials: {
                  instagram:  String(sp?.socials?.instagram ?? ""),
                  twitter:    String(sp?.socials?.twitter ?? ""),
                  facebook:   String(sp?.socials?.facebook ?? ""),
                  youtube:    String(sp?.socials?.youtube ?? ""),
                  linkedin:   String(sp?.socials?.linkedin ?? ""),
                },
                address: {
                  line1:       String(sp?.address?.line1 ?? ""),
                  line2:       String(sp?.address?.line2 ?? ""),
                  city:        String(sp?.address?.city ?? ""),
                  state:       String(sp?.address?.state ?? ""),
                  postal_code: String(sp?.address?.postal_code ?? ""),
                  country:     String(sp?.address?.country ?? "IN"),
                },
                shop_address: {
                  line1:       String(sp?.shop_address?.line1 ?? ""),
                  line2:       String(sp?.shop_address?.line2 ?? ""),
                  city:        String(sp?.shop_address?.city ?? ""),
                  state:       String(sp?.shop_address?.state ?? ""),
                  postal_code: String(sp?.shop_address?.postal_code ?? ""),
                  country:     String(sp?.shop_address?.country ?? "IN"),
                },
                bank: {
                  account_holder: String(sp?.bank_details?.account_holder ?? ""),
                  account_number: String(sp?.bank_details?.account_number ?? ""),
                  ifsc:           String(sp?.bank_details?.ifsc ?? ""),
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
