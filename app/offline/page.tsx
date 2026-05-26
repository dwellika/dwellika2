import Link from "next/link"
import { CloudOff } from "lucide-react"

import { Button } from "@/components/ui/button"

export const metadata = { title: "Offline" }

export default function OfflinePage() {
  return (
    <div className="relative isolate flex min-h-[70vh] items-center overflow-hidden">
      <div className="aurora-bg" aria-hidden="true" />
      <div className="container-page relative z-10 grid place-items-center text-center">
        <CloudOff className="size-12 text-muted-foreground" />
        <p className="mt-3 text-xs uppercase tracking-[0.25em] text-primary">Offline</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">No signal</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          You&apos;re viewing Dwellika offline. Reconnect to load the gallery —
          the works are still here waiting.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Retry</Link>
        </Button>
      </div>
    </div>
  )
}
