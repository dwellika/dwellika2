import { ShieldAlert, ShieldCheck, UserCheck } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Trust & safety",
  description: "How Dwellika keeps the community, the work, and the marketplace safe.",
}

const PILLARS = [
  {
    Icon: UserCheck,
    title: "Identity",
    body: "Sellers submit PAN, address, and bank documents before going live. Artists can opt-in for verification badges that match supporting evidence.",
  },
  {
    Icon: ShieldCheck,
    title: "Content moderation",
    body: "Every artwork, reel, and community post in 'pending' status is reviewed by a human before it appears publicly. Reasons for rejection are sent back to the creator.",
  },
  {
    Icon: ShieldAlert,
    title: "Dispute resolution",
    body: "Open a dispute with evidence. We mediate within 5 business days. Buyers and sellers can escalate without escalating tone.",
  },
]

export default function TrustPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <p className="text-xs uppercase tracking-[0.25em] text-primary">Trust & safety</p>
      <h1 className="mt-2 font-display text-5xl md:text-6xl">
        Built on care, defended by people.
      </h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Dwellika takes a few non-negotiable positions on the platform&apos;s
        integrity. They are what separate us from any feed.
      </p>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        {PILLARS.map((p) => (
          <Card key={p.title}>
            <CardContent className="space-y-2 p-5">
              <div className="grid size-10 place-items-center rounded-md bg-primary/15 text-primary">
                <p.Icon className="size-5" />
              </div>
              <p className="font-display text-lg">{p.title}</p>
              <p className="text-sm text-muted-foreground">{p.body}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-12 space-y-3 text-sm text-muted-foreground">
        <h2 className="font-display text-2xl text-foreground">Reporting</h2>
        <p>
          To report a listing, message, or user, use the report option on any
          surface, or email{" "}
          <a className="text-foreground underline" href="mailto:trust@dwellika.com">
            trust@dwellika.com
          </a>{" "}
          with a link and a short description.
        </p>
        <p>
          Reports stay confidential. Our Trust & Safety team responds within 24
          hours. Serious cases (impersonation, fraud, intellectual property) are
          escalated immediately.
        </p>
      </section>
    </article>
  )
}
