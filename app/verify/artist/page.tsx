import { Shield } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { requireAuth } from "@/lib/auth/rbac"
import { prisma } from "@/lib/prisma"

import { ArtistVerifyForm } from "./ArtistVerifyForm"

export const metadata = { title: "Artist Verification · Dwellika" }

export default async function ArtistVerifyPage() {
  const user = await requireAuth("/signin?next=/verify/artist")

  const [verification, profile] = await Promise.all([
    prisma.artistVerification.findUnique({
      where: { user_id: user.id },
      include: {
        docs: {
          orderBy: { created_at: "desc" },
          select: { id: true, doc_kind: true, status: true, notes: true, created_at: true },
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { username: true, full_name: true, email: true, website: true, socials: true },
    }),
  ])

  const socials = (
    profile?.socials && typeof profile.socials === "object" && !Array.isArray(profile.socials)
      ? profile.socials
      : {}
  ) as Record<string, string>

  const address = (
    verification?.address && typeof verification.address === "object" && !Array.isArray(verification.address)
      ? verification.address
      : {}
  ) as Record<string, string>

  const bank = (
    verification?.bank_details && typeof verification.bank_details === "object" && !Array.isArray(verification.bank_details)
      ? verification.bank_details
      : {}
  ) as Record<string, string>

  const otherSocials = (
    verification?.other_socials && typeof verification.other_socials === "object" && !Array.isArray(verification.other_socials)
      ? verification.other_socials
      : {}
  ) as Record<string, string>

  const docs = (verification?.docs ?? []).map((d) => ({
    ...d,
    created_at: d.created_at.toISOString(),
  }))

  const defaults = {
    full_name:    verification?.full_name ?? profile?.full_name ?? user.full_name ?? "",
    email:        verification?.email ?? profile?.email ?? user.email ?? "",
    username:     verification?.username ?? profile?.username ?? "",
    mobile:       verification?.mobile ?? "",
    address: {
      line1:       address.line1 ?? "",
      line2:       address.line2 ?? "",
      city:        address.city ?? "",
      state:       address.state ?? "",
      postal_code: address.postal_code ?? "",
      country:     address.country ?? "IN",
    },
    instagram_url: verification?.instagram_url ?? socials.instagram ?? "",
    pinterest_url: verification?.pinterest_url ?? socials.pinterest ?? "",
    other_socials: {
      twitter:    otherSocials.twitter ?? socials.twitter ?? "",
      behance:    otherSocials.behance ?? socials.behance ?? "",
      artstation: otherSocials.artstation ?? socials.artstation ?? "",
      youtube:    otherSocials.youtube ?? socials.youtube ?? "",
      linkedin:   otherSocials.linkedin ?? socials.linkedin ?? "",
    },
    website: verification?.website ?? profile?.website ?? "",
    bank: {
      account_holder: bank.account_holder ?? "",
      account_number: bank.account_number ?? "",
      ifsc:           bank.ifsc ?? "",
      bank_name:      bank.bank_name ?? "",
    },
  }

  return (
    <div className="container-page pb-16 pt-16 sm:pt-20">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Become a verified artist</p>
        <h1 className="font-display text-4xl">Artist verification</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Verified artists receive the verified badge, priority discovery placement,
          and unlock commission tools. Review takes 1-3 business days.
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
            <ArtistVerifyForm
              defaults={defaults}
              docs={docs}
              status={verification?.status ?? "draft"}
            />
          </CardContent>
        </Card>

        {/* Why verify */}
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="inline-flex items-center gap-2 text-base">
                <Shield className="size-5 text-primary" /> Why verify?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Verified artists get a prominent badge on their profile and artworks, increasing buyer confidence.</p>
              <p>Priority placement in discovery feeds, search results, and collections.</p>
              <p>Access to commission tools, withdrawal support, and dedicated seller promotions.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">What we check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <ul className="list-inside list-disc space-y-1">
                <li>Government-issued ID (PAN / Aadhaar)</li>
                <li>Address proof</li>
                <li>Portfolio samples — confirm original work</li>
                <li>Bank details — for secure payouts</li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
