import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

interface PaginationControlsProps {
  page: number
  totalCount: number
  pageSize: number
  /** All current search params so every link preserves them (except `page`). */
  searchParams: Record<string, string | undefined>
  basePath: string
}

export function PaginationControls({
  page,
  totalCount,
  pageSize,
  searchParams,
  basePath,
}: PaginationControlsProps) {
  const totalPages = Math.ceil(totalCount / pageSize)
  if (totalPages <= 1) return null

  function buildHref(p: number) {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(searchParams)) {
      if (v !== undefined && v !== "" && k !== "page") params.set(k, v)
    }
    if (p > 1) params.set("page", String(p))
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  // Build compact page list: 1 … prev cur next … last
  const nums: (number | "…")[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) nums.push(i)
  } else {
    nums.push(1)
    if (page > 3) nums.push("…")
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      nums.push(i)
    }
    if (page < totalPages - 2) nums.push("…")
    nums.push(totalPages)
  }

  const btn = "flex size-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors"

  return (
    <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Pagination">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-label="Previous page"
        aria-disabled={page <= 1}
        className={cn(btn, "border-border hover:bg-muted/50", page <= 1 && "pointer-events-none opacity-40")}
      >
        <ChevronLeft className="size-4" />
      </Link>

      {nums.map((n, i) =>
        n === "…" ? (
          <span key={`e${i}`} className="flex size-9 items-center justify-center text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={n}
            href={buildHref(n)}
            aria-current={n === page ? "page" : undefined}
            className={cn(
              btn,
              n === page
                ? "border-primary bg-primary text-primary-foreground pointer-events-none"
                : "border-border hover:bg-muted/50",
            )}
          >
            {n}
          </Link>
        ),
      )}

      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        aria-label="Next page"
        aria-disabled={page >= totalPages}
        className={cn(btn, "border-border hover:bg-muted/50", page >= totalPages && "pointer-events-none opacity-40")}
      >
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  )
}
