import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Careers",
  description: "Open roles at Dwellika — build the marketplace for the next generation of artists.",
}

const ROLES = [
  {
    title: "Senior Product Designer",
    location: "Remote · India / EU",
    type: "Full-time",
    summary: "Shape the surfaces collectors and artists use every day.",
  },
  {
    title: "Backend Engineer · Search & AI",
    location: "Remote",
    type: "Full-time",
    summary: "Own embeddings, semantic search, and recommendation quality.",
  },
  {
    title: "Community Lead · India",
    location: "Mumbai",
    type: "Full-time",
    summary: "Run the on-the-ground programmes for our flagship communities.",
  },
  {
    title: "Trust & Safety Specialist",
    location: "Remote",
    type: "Full-time",
    summary: "Lead moderation tooling and dispute resolution playbooks.",
  },
]

export default function CareersPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <p className="text-xs uppercase tracking-[0.25em] text-primary">Careers</p>
      <h1 className="mt-2 font-display text-5xl md:text-6xl">
        Build the museum with us.
      </h1>
      <p className="mt-6 text-lg text-muted-foreground">
        We are a small, considered team. Everyone we hire defines the next year
        of the product. Compensation is competitive. Equity is real.
      </p>

      <section className="mt-12 space-y-3">
        <h2 className="font-display text-2xl">Open roles</h2>
        {ROLES.map((role) => (
          <Card key={role.title}>
            <CardContent className="flex flex-col gap-2 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-display text-lg">{role.title}</p>
                <p className="text-sm text-muted-foreground">{role.summary}</p>
                <div className="mt-1 flex gap-2 text-xs">
                  <Badge variant="outline">{role.location}</Badge>
                  <Badge variant="secondary">{role.type}</Badge>
                </div>
              </div>
              <Button asChild variant="outline">
                <Link href="/contact">Apply</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-12 rounded-2xl border border-border bg-card p-8">
        <h2 className="font-display text-2xl">Don&apos;t see your role?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We hire whenever we meet exceptional people. Send us a note describing
          how you would help us, and we will write back.
        </p>
        <Button asChild className="mt-4">
          <Link href="/contact">Write to us</Link>
        </Button>
      </section>
    </article>
  )
}
