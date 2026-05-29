"use client"

import { useEffect } from "react"
import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"

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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black text-white md:static md:h-[calc(100dvh-4rem)]">
      <p className="text-sm text-white/60">Reels couldn&apos;t load</p>
      <Button
        variant="outline"
        className="gap-2 border-white/20 text-white hover:bg-white/10"
        onClick={reset}
      >
        <RefreshCw className="size-4" />
        Try again
      </Button>
    </div>
  )
}
