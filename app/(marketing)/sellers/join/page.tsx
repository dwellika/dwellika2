import Link from "next/link"
import { ArrowRight, BarChart3, BadgeCheck, Globe, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Sell on Dwellika",
  description: "Become a verified seller — set up your shop, list your products, and ship to a global audience.",
}

const BENEFITS = [
  {
    Icon: BadgeCheck,
    title: "Verified seller badge",
    body: "Documents on file, badge on every listing — collectors trust faster.",
  },
  {
    Icon: BarChart3,
    title: "Real-time analytics",
    body: "Revenue, orders, conversion, and inventory dashboards in one place.",
  },
  {
    Icon: Globe,
    title: "Global reach",
    body: "Ship from anywhere to anywhere. Built-in support for multiple currencies.",
  },
  {
    Icon: Wallet,
    title: "Fair payouts",
    body: "Stripe + Razorpay payouts every Friday. Transparent fee structure — no surprises.",
  },
]

const STEPS = [
  { n: 1, title: "Create your account", desc: "Sign up for free in two minutes." },
  { n: 2, title: "Submit documents", desc: "PAN, address, bank — reviewed in 1-3 days." },
  { n: 3, title: "List your products", desc: "Upload, describe, price. Set inventory and shipping." },
  { n: 4, title: "Start selling", desc: "Verified badge, listings live, payouts roll in." },
]

export default function SellerJoinPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <p className="text-xs uppercase tracking-[0.25em] text-primary">For sellers</p>
      <h1 className="mt-2 font-display text-5xl md:text-6xl">
        Sell where collectors actually look.
      </h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Dwellika is the marketplace for art and the people who supply the artists
        who make it. Verified sellers reach a global audience of curators,
        hobbyists, and collectors.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <Button asChild size="lg">
          <Link href="/sellers/verify">
            Start verification <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/signup">Create account</Link>
        </Button>
      </div>

      <section className="mt-16 grid gap-4 sm:grid-cols-2">
        {BENEFITS.map((b) => (
          <Card key={b.title}>
            <CardContent className="space-y-2 p-5">
              <div className="grid size-10 place-items-center rounded-md bg-primary/15 text-primary">
                <b.Icon className="size-5" />
              </div>
              <p className="font-display text-lg">{b.title}</p>
              <p className="text-sm text-muted-foreground">{b.body}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-16">
        <h2 className="mb-6 font-display text-3xl">How onboarding works</h2>
        <ol className="space-y-3">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 font-display text-lg text-primary">
                {s.n}
              </span>
              <div>
                <p className="font-medium">{s.title}</p>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
        <h2 className="font-display text-3xl">Ready when you are.</h2>
        <p className="mt-2 text-muted-foreground">
          Verification opens your shop. We&apos;ll handle the rest.
        </p>
        <Button asChild className="mt-6">
          <Link href="/sellers/verify">Start verification →</Link>
        </Button>
      </section>
    </article>
  )
}
