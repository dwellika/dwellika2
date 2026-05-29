"use client"

import { useEffect } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
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
        <p className="text-xs uppercase tracking-[0.25em] text-primary">The collective</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Artists</h1>
      </header>
      <ErrorState
        title="Couldn't load artists"
        message="The artist directory is temporarily unavailable. Try again in a moment."
        retry={reset}
        className="min-h-[40vh]"
      />
      <div className="mt-6 flex justify-center gap-3">
        <Button asChild variant="outline">
          <Link href="/communities">Browse communities</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  )
}
