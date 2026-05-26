"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { ThumbsUp } from "lucide-react"
import { toast } from "sonner"

import { castVote, removeVote } from "@/lib/data/competition-actions"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function VoteButton({
  submissionId,
  initialVoted,
  initialCount,
  isAuthed,
  disabled,
}: {
  submissionId: string
  initialVoted: boolean
  initialCount: number
  isAuthed: boolean
  disabled?: boolean
}) {
  const router = useRouter()
  const [voted, setVoted] = useState(initialVoted)
  const [count, setCount] = useState(initialCount)
  const [pending, startTransition] = useTransition()

  return (
    <Button
      type="button"
      size="sm"
      variant={voted ? "default" : "outline"}
      disabled={pending || disabled}
      className={cn(voted && "bg-primary text-primary-foreground")}
      onClick={() => {
        if (!isAuthed) {
          router.push(`/signin?next=${encodeURIComponent(window.location.pathname)}`)
          return
        }
        setVoted((v) => !v)
        setCount((c) => c + (voted ? -1 : 1))
        startTransition(async () => {
          const fn = voted ? removeVote : castVote
          const result = await fn(submissionId)
          if (!result.ok) {
            setVoted((v) => !v)
            setCount((c) => c + (voted ? 1 : -1))
            toast.error(result.error)
          }
        })
      }}
    >
      <ThumbsUp className="size-4" /> Vote
      <span className="tabular-nums">{count}</span>
    </Button>
  )
}
