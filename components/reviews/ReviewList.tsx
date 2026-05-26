import { BadgeCheck } from "lucide-react"

import { Stars } from "./Stars"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { ReviewWithReviewer } from "@/lib/data/reviews"

interface ReviewListProps {
  reviews: ReviewWithReviewer[]
  summary: { count: number; average: number; distribution: number[] }
}

export function ReviewList({ reviews, summary }: ReviewListProps) {
  if (summary.count === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
        <p className="font-display text-lg">No reviews yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Be the first to share your experience.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ReviewSummary {...summary} />
      <div className="grid gap-3 md:grid-cols-2">
        {reviews.map((r) => (
          <Card key={r.id}>
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center gap-3">
                <Avatar className="size-8">
                  <AvatarImage src={r.reviewer?.avatar_url ?? undefined} />
                  <AvatarFallback>{(r.reviewer?.full_name ?? "?").slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {r.reviewer?.full_name ?? `@${r.reviewer?.username}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Stars rating={r.rating} size="sm" className="ml-auto" />
              </div>
              {r.body ? <p className="text-sm">{r.body}</p> : null}
              {r.is_verified_purchase ? (
                <Badge variant="outline" className="gap-1">
                  <BadgeCheck className="size-3" /> Verified purchase
                </Badge>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ReviewSummary({
  count,
  average,
  distribution,
}: {
  count: number
  average: number
  distribution: number[]
}) {
  return (
    <div className="grid items-center gap-6 rounded-2xl border border-border bg-card p-5 md:grid-cols-[180px_minmax(0,1fr)]">
      <div className="text-center">
        <p className="font-display text-5xl">{average.toFixed(1)}</p>
        <Stars rating={Math.round(average)} size="md" className="justify-center" />
        <p className="mt-1 text-xs text-muted-foreground">{count.toLocaleString()} reviews</p>
      </div>
      <div className="space-y-1">
        {[5, 4, 3, 2, 1].map((stars) => {
          const n = distribution[stars - 1] ?? 0
          const pct = count > 0 ? (n / count) * 100 : 0
          return (
            <div key={stars} className="flex items-center gap-2 text-xs">
              <span className="w-3 tabular-nums text-muted-foreground">{stars}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-8 text-right tabular-nums text-muted-foreground">{n}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
