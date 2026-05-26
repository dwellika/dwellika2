import Link from "next/link"
import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden">
      <div className="aurora-bg" aria-hidden="true" />
      <div className="container-page flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to Dwellika
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
