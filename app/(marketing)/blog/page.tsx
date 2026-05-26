import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Blog",
  description: "Essays on craft, the marketplace, and the artists who build it.",
}

const POSTS = [
  {
    slug: "why-museum-grade",
    title: "Why we built a museum-grade marketplace",
    excerpt:
      "Art platforms treat art like content. We wanted one that treats it like art. Here is the design philosophy.",
    date: "Apr 12, 2026",
    readTime: "6 min read",
  },
  {
    slug: "watercolor-monsoon-2026",
    title: "The Watercolor Monsoon competition, in pictures",
    excerpt:
      "Three hundred entries, twelve winners, and a lot to learn from this year&apos;s most-watched challenge.",
    date: "Mar 28, 2026",
    readTime: "9 min read",
  },
  {
    slug: "ai-search-internals",
    title: "How AI search works on Dwellika",
    excerpt:
      "We use pg_vector + OpenAI embeddings. Here is the architecture, the tradeoffs, and what we are working on next.",
    date: "Mar 10, 2026",
    readTime: "11 min read",
  },
]

export default function BlogPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <p className="text-xs uppercase tracking-[0.25em] text-primary">Dispatch</p>
      <h1 className="mt-2 font-display text-5xl md:text-6xl">The Dwellika blog</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Essays on craft, the marketplace, and the artists who build it.
      </p>

      <div className="mt-12 space-y-4">
        {POSTS.map((p) => (
          <Card key={p.slug}>
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {p.date} · {p.readTime}
              </p>
              <Link href="#" className="block">
                <h2 className="mt-1 font-display text-2xl hover:underline">{p.title}</h2>
              </Link>
              <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </article>
  )
}
