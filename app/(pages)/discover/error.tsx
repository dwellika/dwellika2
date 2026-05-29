"use client"

import { useEffect } from "react"
import { Sparkles } from "lucide-react"

import { ErrorState } from "@/components/ui/error-state"

export default function Error({
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
    <div className="container-page py-12">
      <header className="mb-8">
        <p className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.25em] text-primary">
          <Sparkles className="size-3" /> AI search
        </p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Discover</h1>
      </header>
      <ErrorState
        title="Search unavailable"
        message="AI search is temporarily unavailable. Try browsing artists or collections manually."
        retry={reset}
        className="min-h-[40vh]"
      />
    </div>
  )
}
