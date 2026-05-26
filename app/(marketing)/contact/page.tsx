import { Mail, MessageSquare, ShieldAlert, Users } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Contact",
  description: "Get in touch with the Dwellika team.",
}

const CHANNELS = [
  {
    Icon: Mail,
    label: "General",
    email: "hello@dwellika.com",
    desc: "Press, partnerships, anything else.",
  },
  {
    Icon: MessageSquare,
    label: "Support",
    email: "support@dwellika.com",
    desc: "Account issues, orders, payments.",
  },
  {
    Icon: ShieldAlert,
    label: "Trust & safety",
    email: "trust@dwellika.com",
    desc: "Disputes, takedowns, abuse reports.",
  },
  {
    Icon: Users,
    label: "Sellers & artists",
    email: "creators@dwellika.com",
    desc: "Onboarding, verification, payouts.",
  },
]

export default function ContactPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <p className="text-xs uppercase tracking-[0.25em] text-primary">Contact</p>
      <h1 className="mt-2 font-display text-5xl md:text-6xl">Talk to us</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Pick the channel that fits — we respond within a working day.
      </p>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {CHANNELS.map((c) => (
          <Card key={c.label}>
            <CardContent className="space-y-2 p-5">
              <div className="grid size-10 place-items-center rounded-md bg-primary/15 text-primary">
                <c.Icon className="size-5" />
              </div>
              <p className="font-display text-lg">{c.label}</p>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
              <a
                href={`mailto:${c.email}`}
                className="inline-flex text-sm font-medium text-primary hover:underline"
              >
                {c.email}
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="mt-12 rounded-2xl border border-border bg-card p-8">
        <h2 className="font-display text-2xl">In person</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Dwellika HQ · Bandra, Mumbai 400050 · India
        </p>
      </section>
    </article>
  )
}
