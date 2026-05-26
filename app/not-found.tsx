import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-[70vh] items-center overflow-hidden">
      <div className="aurora-bg" aria-hidden="true" />
      <div className="container-page relative z-10 grid place-items-center text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">404</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">
          The frame is empty.
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          We couldn&apos;t find what you were looking for. The work may have moved
          on, or the canvas was never hung here at all.
        </p>
        <div className="mt-6 flex gap-3">
          <Button asChild>
            <Link href="/">Back home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/shopping/arts">Explore art</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
