import { Shield } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { requireAuth } from "@/lib/auth/rbac"
import { prisma } from "@/lib/prisma"

import { SellerVerifyForm } from "./SellerVerifyForm"

export const metadata = { title: "Seller Verification · Dwellika" }

function asRecord(v: unknown): Record<string, string> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, string>) : {}
}

export default async function SellerVerifyPage() {
  const user = await requireAuth("/signin?next=/verify/seller")

  const [profile, sellerProfile, docs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { username: true, full_name: true, email: true, website: true },
    }),
    prisma.sellerProfile.findUnique({ where: { id: user.id } }),
    prisma.sellerVerificationDoc.findMany({
      where: { seller_id: user.id },
      orderBy: { created_at: "desc" },
      select: { id: true, doc_kind: true, status: true, notes: true, created_at: true },
    }),
  ])

  const socials = asRecord(sellerProfile?.socials)
  const address = asRecord(sellerProfile?.address)
  const shopAddress = asRecord(sellerProfile?.shop_address)
  const bank = asRecord(sellerProfile?.bank_details)

  const defaults = {
    full_name: profile?.full_name ?? user.full_name ?? "",
    email: profile?.email ?? user.email ?? "",
    username: profile?.username ?? "",
    mobile: sellerProfile?.mobile ?? "",
    business_name: sellerProfile?.business_name ?? "",
    legal_name: sellerProfile?.legal_name ?? "",
    gst_number: sellerProfile?.gst_number ?? "",
    pan_number: sellerProfile?.pan_number ?? "",
    website: sellerProfile?.website ?? profile?.website ?? "",
    socials,
    address: {
      line1: address.line1 ?? "",
      line2: address.line2 ?? "",
      city: address.city ?? "",
      state: address.state ?? "",
      postal_code: address.postal_code ?? "",
      country: address.country ?? "IN",
    },
    shop_address: {
      line1: shopAddress.line1 ?? "",
      line2: shopAddress.line2 ?? "",
      city: shopAddress.city ?? "",
      state: shopAddress.state ?? "",
      postal_code: shopAddress.postal_code ?? "",
      country: shopAddress.country ?? "IN",
    },
    bank: {
      account_holder: bank.account_holder ?? "",
      account_number: bank.account_number ?? "",
      ifsc: bank.ifsc ?? "",
      bank_name: bank.bank_name ?? "",
    },
  }

  const docsSerialised = docs.map((d) => ({ ...d, created_at: d.created_at.toISOString() }))

  return (
    <div className="container-page pb-16 pt-16 sm:pt-20">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Become a verified seller</p>
        <h1 className="font-display text-4xl">Seller verification</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Verified sellers can list products across Home Décor, Art Supplies and Wearing Arts,
          and receive the verified badge. Review takes 1-3 business days.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Verification details</CardTitle>
            <CardDescription>
              All documents are stored securely and are only visible to the Dwellika team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SellerVerifyForm
              defaults={defaults}
              docs={docsSerialised}
              status={sellerProfile?.status ?? "draft"}
            />
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="inline-flex items-center gap-2 text-base">
                <Shield className="size-5 text-primary" /> Why verify?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Verified sellers get a prominent badge, building buyer trust.</p>
              <p>Unlock product listings, inventory tools, and payout support.</p>
              <p>Priority placement in the shop and search results.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">What we check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <ul className="list-inside list-disc space-y-1">
                <li>PAN (and GST, if registered)</li>
                <li>Shop / address proof</li>
                <li>Bank details — for secure payouts</li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
