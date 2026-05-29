"use client"

import { CloudOff, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface OfflineStateProps {
  title?: string
  message?: string
  className?: string
}

export function OfflineState({
  title = "You're offline",
  message = "Check your connection and try again. Your work is safe.",
  className,
}: OfflineStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-16 text-center",
        className,
      )}
    >
      <CloudOff className="size-10 text-muted-foreground/50" />
      <p className="mt-4 font-display text-2xl">{title}</p>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">{message}</p>
      <Button
        size="sm"
        variant="outline"
        className="mt-5 gap-2"
        onClick={() => window.location.reload()}
      >
        <RefreshCw className="size-3.5" />
        Retry
      </Button>
    </div>
  )
}
