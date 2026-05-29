import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  message?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, message, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-16 text-center",
        className,
      )}
    >
      {icon && <div className="mb-3 text-muted-foreground/60">{icon}</div>}
      <p className="font-display text-2xl">{title}</p>
      {message && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{message}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
