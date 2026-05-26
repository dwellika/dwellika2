"use client"

import Link from "next/link"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="relative isolate flex min-h-[70vh] items-center overflow-hidden">
      <div className="aurora-bg" aria-hidden="true" />
      <div className="container-page relative z-10 grid place-items-center text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-destructive">
          Unexpected error
        </p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">
          Something cracked in the glass.
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          We&apos;ve been notified. Try the gallery again — the artwork is still
          here.
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-xs text-muted-foreground/80">
            ref: {error.digest}
          </p>
        ) : null}
        <div className="mt-6 flex gap-3">
          <Button onClick={() => reset()}>Try again</Button>
          <Button asChild variant="outline">
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
