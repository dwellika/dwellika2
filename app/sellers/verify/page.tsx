import { redirect } from "next/navigation"
import { Shield } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { requireAuth } from "@/lib/auth/rbac"
import { createClient } from "@/lib/supabase/server"

import { VerifyForm } from "./VerifyForm"

export const metadata = { title: "Seller verification" }

export default async function VerifyPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("seller_profiles")
    .select("business_name, legal_name, gst_number, pan_number, is_verified, address, bank_details")
    .eq("id", user.id)
    .maybeSingle()

  const { data: docs } = await supabase
    .from("seller_verification_docs")
    .select("id, doc_kind, status, notes, created_at, reviewed_at")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false })

  const sellerProfile = profile as
    | {
        business_name: string
        legal_name: string | null
        gst_number: string | null
        pan_number: string | null
        is_verified: boolean
        address: Record<string, string | null> | null
        bank_details: Record<string, string | null> | null
      }
    | null
  const verificationDocs =
    (docs ?? []) as Array<{
      id: string
      doc_kind: string
      status: string
      notes: string | null
      created_at: string
      reviewed_at: string | null
    }>

  if (sellerProfile?.is_verified) {
    redirect("/seller/dashboard?verified=1")
  }

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
                business_name: sellerProfile?.business_name ?? "",
                legal_name: sellerProfile?.legal_name ?? "",
                gst_number: sellerProfile?.gst_number ?? "",
                pan_number: sellerProfile?.pan_number ?? "",
                address: {
                  line1: String(sellerProfile?.address?.line1 ?? ""),
                  line2: String(sellerProfile?.address?.line2 ?? ""),
                  city: String(sellerProfile?.address?.city ?? ""),
                  state: String(sellerProfile?.address?.state ?? ""),
                  postal_code: String(sellerProfile?.address?.postal_code ?? ""),
                  country: String(sellerProfile?.address?.country ?? "IN"),
                },
                bank: {
                  account_holder: String(sellerProfile?.bank_details?.account_holder ?? ""),
                  account_number: String(sellerProfile?.bank_details?.account_number ?? ""),
                  ifsc: String(sellerProfile?.bank_details?.ifsc ?? ""),
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
              Documents are stored in a private Supabase bucket with row-level
              security — only the Dwellika team and you can read them.
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
