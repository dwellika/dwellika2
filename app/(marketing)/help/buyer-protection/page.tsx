import Link from "next/link"
import { CheckCircle2, ShieldCheck } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Buyer protection",
  description: "What every Dwellika purchase is covered for, and how disputes get resolved.",
}

const COVERED = [
  "Item not received within 30 days of payment.",
  "Item arrives damaged or counterfeit.",
  "Item is materially different from how it was described.",
  "Seller becomes unresponsive after payment.",
]

export default function BuyerProtectionPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <p className="text-xs uppercase tracking-[0.25em] text-primary">Help</p>
      <h1 className="mt-2 font-display text-4xl md:text-5xl">Buyer protection</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Every paid purchase on Dwellika is covered for the duration of the
        transaction — until you confirm delivery and any disputes are resolved.
      </p>

      <section className="mt-10 space-y-3">
        <h2 className="font-display text-2xl">What you&apos;re covered for</h2>
        <Card>
          <CardContent className="space-y-3 p-5">
            {COVERED.map((c) => (
              <p key={c} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                <span>{c}</span>
              </p>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mt-10 space-y-2">
        <h2 className="font-display text-2xl">How it works</h2>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li>1. Open a dispute from the order detail page with photos or evidence.</li>
          <li>2. The seller has 72 hours to respond.</li>
          <li>3. If you can&apos;t agree, our Trust & Safety team mediates.</li>
          <li>4. Resolution within 5 business days. Refunds go back to the original payment method.</li>
        </ol>
      </section>

      <section className="mt-12 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
        <ShieldCheck className="size-6 text-emerald-400" />
        <p className="mt-2 font-display text-xl">Our promise</p>
        <p className="mt-1 text-sm text-muted-foreground">
          You only pay for what you receive. If something goes wrong, we&apos;ll
          make it right — even if that means refunding from our own balance.
        </p>
        <Link
          href="/disputes"
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          See my disputes →
        </Link>
      </section>
    </article>
  )
}
