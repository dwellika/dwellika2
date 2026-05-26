import Link from "next/link"

import { Button } from "@/components/ui/button"

export const metadata = { title: "Forbidden" }

export default function ForbiddenPage() {
  return (
    <div className="relative isolate flex min-h-[70vh] items-center overflow-hidden">
      <div className="aurora-bg" aria-hidden="true" />
      <div className="container-page relative z-10 grid place-items-center text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">403</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">
          That door is closed.
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          You don&apos;t have permission to view this page. If this is a mistake,
          contact a Dwellika administrator.
        </p>
        <div className="mt-6 flex gap-3">
          <Button asChild>
            <Link href="/">Back home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/help">Get help</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
