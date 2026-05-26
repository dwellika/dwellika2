import Link from "next/link"
import type { ReactNode } from "react"

/**
 * Renders @username mentions as Next.js Link tags. Pure presentation
 * helper — does NOT validate that the username exists.
 */
export function renderMentions(input: string): ReactNode {
  const parts = input.split(/(@[a-z0-9_]+)/gi)
  return parts.map((p, i) => {
    if (/^@[a-z0-9_]+$/i.test(p)) {
      const handle = p.slice(1)
      return (
        <Link
          key={i}
          href={`/u/${handle}`}
          className="font-medium text-primary hover:underline"
        >
          {p}
        </Link>
      )
    }
    return p
  })
}
