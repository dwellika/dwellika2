"use client"

import Link from "next/link"
import { useEffect, useState, useTransition } from "react"
import { Loader2, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SmartImage } from "@/components/ui/smart-image"

interface Result {
  id: string
  title: string
  slug: string
  artist_id: string
  artist_username: string | null
  primary_url: string | null
  price: number | null
  currency: string
  for_sale: boolean
  similarity: number
}

interface SmartSearchProps {
  placeholder?: string
  initialQuery?: string
  compact?: boolean
}

export function SmartSearch({
  placeholder = "Try: blue watercolor mountain at dusk",
  initialQuery = "",
  compact,
}: SmartSearchProps) {
  const [q, setQ] = useState(initialQuery)
  const [results, setResults] = useState<Result[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [unavailable, setUnavailable] = useState(false)
  const [pending, startTransition] = useTransition()

  const search = async (query: string) => {
    setError(null)
    setResults(null)
    if (!query.trim()) return
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ q: query, kind: "artworks", limit: 12 }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        if (json.configured === false) {
          setUnavailable(true)
          return
        }
        setError(json.error ?? "Search failed.")
        return
      }
      setResults(json.results)
    } catch {
      setError("Network error — please try again.")
    }
  }

  useEffect(() => {
    if (initialQuery) {
      startTransition(() => search(initialQuery).then(() => {}))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={compact ? "" : "space-y-6"}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          startTransition(() => search(q).then(() => {}))
        }}
        className="relative flex gap-2"
      >
        <div className="relative flex-1">
          <Sparkles className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={placeholder}
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={pending || !q.trim()}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : "Search"}
        </Button>
      </form>

      {unavailable ? (
        <p className="text-sm text-muted-foreground">
          AI search is not available yet — add{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">OPENAI_API_KEY</code>{" "}
          to <code className="rounded bg-muted px-1 py-0.5 text-xs">.env.local</code> to enable.
        </p>
      ) : error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {results ? (
        results.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No matches. Try a less specific phrase.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {results.map((r) => (
              <Link
                key={r.id}
                href={r.artist_username ? `/artworks/${r.artist_username}/${r.slug}` : "/shopping/arts"}
              >
                <div className="group overflow-hidden rounded-xl border border-border bg-card">
                  <div className="relative aspect-[4/5] w-full overflow-hidden">
                    <SmartImage
                      src={r.primary_url}
                      alt={r.title}
                      kind="artwork"
                      seed={r.title}
                      fill
                      sizes="(max-width:768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                      {(r.similarity * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-1 font-medium">{r.title}</p>
                    {r.for_sale && r.price != null ? (
                      <p className="text-xs text-muted-foreground">
                        {r.currency} {Number(r.price).toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">View only</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : null}
    </div>
  )
}
