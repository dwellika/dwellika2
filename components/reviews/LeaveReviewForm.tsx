"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { submitReview } from "./actions"
import { Stars } from "./Stars"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { ReviewTarget } from "@/lib/types/database"

interface Props {
  targetKind: ReviewTarget
  targetId: string
  orderId?: string | null
  isAuthed: boolean
}

export function LeaveReviewForm({ targetKind, targetId, orderId, isAuthed }: Props) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [pending, startTransition] = useTransition()

  if (!isAuthed) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
        <button
          type="button"
          className="font-medium text-foreground underline"
          onClick={() => router.push(`/signin?next=${encodeURIComponent(window.location.pathname)}`)}
        >
          Sign in
        </button>{" "}
        to leave a review.
      </div>
    )
  }

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          fd.set("targetKind", targetKind)
          fd.set("targetId", targetId)
          if (orderId) fd.set("orderId", orderId)
          fd.set("rating", String(rating))
          const result = await submitReview(fd)
          if (result.ok) {
            toast.success("Review submitted.")
            setRating(0)
            router.refresh()
          } else {
            toast.error(result.error)
          }
        })
      }
      className="space-y-3 rounded-2xl border border-border bg-card p-5"
    >
      <p className="text-sm font-medium">Leave a review</p>
      <Stars rating={rating} size="lg" interactive onChange={setRating} />
      <Textarea name="body" rows={3} placeholder="What did you love? What could be better?" maxLength={1200} />
      <div className="flex justify-end">
        <Button type="submit" disabled={pending || rating === 0}>
          {pending ? "Submitting…" : "Submit review"}
        </Button>
      </div>
    </form>
  )
}
