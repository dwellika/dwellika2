import Link from "next/link"
import {
  ArrowRight,
  CreditCard,
  HelpCircle,
  PackageCheck,
  ShieldAlert,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Help center",
  description: "Find answers about orders, payments, returns, verification, and more.",
}

const TOPICS = [
  { href: "/help/shipping", Icon: Truck, label: "Shipping & returns", desc: "Tracking, delivery windows, returns window" },
  { href: "/help/buyer-protection", Icon: ShieldAlert, label: "Buyer protection", desc: "What you&apos;re covered for and how disputes work" },
  { href: "/sellers/verification", Icon: PackageCheck, label: "Seller verification", desc: "Required docs and review timeline" },
  { href: "/help#payments", Icon: CreditCard, label: "Payments", desc: "Stripe, Razorpay, UPI, cards, net banking" },
  { href: "/help#orders", Icon: ShoppingBag, label: "Orders", desc: "Order states, cancellations, edits" },
  { href: "/help#account", Icon: Users, label: "Account", desc: "Sign-in, profile, settings, notifications" },
]

const FAQ = [
  {
    q: "How long does shipping take?",
    a: "Most domestic orders ship within 3-5 business days and arrive within 5-10. International shipping varies by destination — see Shipping & returns for the full table.",
  },
  {
    q: "Can I return an artwork I purchased?",
    a: "Original artworks are non-returnable except in case of damage, in which case Buyer Protection applies. Prints can be returned within 7 days of delivery.",
  },
  {
    q: "How do I become a verified seller?",
    a: "Submit your verification documents from the Seller dashboard — PAN, address proof, and bank details are required. Review takes 1-3 business days.",
  },
  {
    q: "Which payment methods do you support?",
    a: "We support Stripe (cards, wallets) and Razorpay (UPI, cards, net banking). At checkout you can choose either.",
  },
  {
    q: "How do I open a dispute?",
    a: "On any delivered order, tap “Open dispute” on the order detail page. Add evidence and we&apos;ll mediate between you and the seller.",
  },
]

export default function HelpPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <p className="text-xs uppercase tracking-[0.25em] text-primary">Help center</p>
      <h1 className="mt-2 font-display text-5xl md:text-6xl">How can we help?</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Quick answers, deeper guides, and a direct line to our team when you
        need it.
      </p>

      <section className="mt-12 grid gap-3 sm:grid-cols-2">
        {TOPICS.map((t) => (
          <Link key={t.href} href={t.href}>
            <Card className="group h-full transition-all hover:border-primary/40">
              <CardContent className="flex items-center gap-3 p-5">
                <div className="grid size-10 place-items-center rounded-md bg-primary/15 text-primary">
                  <t.Icon className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <section className="mt-16">
        <div className="mb-4 inline-flex items-center gap-2">
          <HelpCircle className="size-5 text-primary" />
          <h2 className="font-display text-2xl">Frequently asked</h2>
        </div>
        <div className="space-y-4">
          {FAQ.map((f) => (
            <Card key={f.q}>
              <CardContent className="p-5">
                <p className="font-medium">{f.q}</p>
                <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
        <p className="font-display text-2xl">Still stuck?</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Email us at{" "}
          <a className="text-foreground underline" href="mailto:support@dwellika.com">
            support@dwellika.com
          </a>{" "}
          — we reply within a business day.
        </p>
      </section>
    </article>
  )
}
