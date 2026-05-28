import { Sparkles } from "lucide-react"

import { SmartSearch } from "@/components/ai/SmartSearch"
import { isEmbeddingConfigured } from "@/lib/ai/provider"

export const metadata = {
  title: "Discover",
  description: "Describe what you're looking for in plain English — AI finds the matching works.",
}

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function DiscoverPage({ searchParams }: PageProps) {
  const { q } = await searchParams

  return (
    <div className="container-page py-12">
      <header className="mb-8">
        <p className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.25em] text-primary">
          <Sparkles className="size-3" /> AI search
        </p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Discover</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Type the mood, palette, or subject you&apos;re after — Dwellika finds matching
          artworks across every artist on the platform.
        </p>
      </header>

      {!isEmbeddingConfigured() ? (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          AI search is disabled. Add{" "}
          <code className="rounded bg-muted px-1.5 py-0.5">AI_EMBEDDING_KEY</code>{" "}
          to <code>.env.local</code> to enable.
        </div>
      ) : null}

      <SmartSearch initialQuery={q ?? ""} />
    </div>
  )
}
