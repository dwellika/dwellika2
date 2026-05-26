import type { ReactNode } from "react"

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <article className="container-page max-w-3xl py-16">
      <div className="prose prose-invert prose-headings:font-display">{children}</div>
    </article>
  )
}
