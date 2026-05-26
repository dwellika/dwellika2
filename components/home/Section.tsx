import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

export interface SectionProps {
  eyebrow?: string
  title: string
  description?: string
  href?: string
  hrefLabel?: string
  children: React.ReactNode
  className?: string
}

export function Section({
  eyebrow,
  title,
  description,
  href,
  hrefLabel = "View all",
  children,
  className,
}: SectionProps) {
  return (
    <section className={cn("container-page py-16 md:py-24", className)}>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="font-display text-3xl md:text-4xl">{title}</h2>
          {description ? (
            <p className="mt-2 text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {href ? (
          <Link
            href={href}
            className="group hidden items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
          >
            {hrefLabel}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  )
}
