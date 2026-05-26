"use client"

import { Star } from "lucide-react"

import { cn } from "@/lib/utils"

interface StarsProps {
  rating: number // 0..5
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  onChange?: (next: number) => void
  className?: string
}

const SIZE = { sm: "size-3.5", md: "size-4", lg: "size-5" } as const

export function Stars({ rating, size = "md", interactive = false, onChange, className }: StarsProps) {
  return (
    <span className={cn("inline-flex gap-0.5", className)}>
      {Array.from({ length: 5 }).map((_, i) => {
        const value = i + 1
        const filled = value <= Math.round(rating)
        return interactive ? (
          <button
            key={i}
            type="button"
            aria-label={`Rate ${value} of 5`}
            onClick={() => onChange?.(value)}
            className="cursor-pointer transition-transform hover:scale-110"
          >
            <Star className={cn(SIZE[size], filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
          </button>
        ) : (
          <Star
            key={i}
            className={cn(SIZE[size], filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground")}
          />
        )
      })}
    </span>
  )
}
