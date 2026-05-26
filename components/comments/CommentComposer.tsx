"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { postComment } from "@/lib/data/comment-actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { ReactionTarget } from "@/lib/types/database"

interface Props {
  targetKind: ReactionTarget
  targetId: string
  parentId?: string
  isAuthed: boolean
  placeholder?: string
  compact?: boolean
}

export function CommentComposer({
  targetKind,
  targetId,
  parentId,
  isAuthed,
  placeholder = "Add a comment…",
  compact,
}: Props) {
  const router = useRouter()
  const [body, setBody] = useState("")
  const [pending, startTransition] = useTransition()

  if (!isAuthed) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
        <button
          type="button"
          className="font-medium text-foreground underline"
          onClick={() =>
            router.push(`/signin?next=${encodeURIComponent(window.location.pathname)}`)
          }
        >
          Sign in
        </button>{" "}
        to leave a comment.
      </div>
    )
  }

  return (
    <form
      action={() =>
        startTransition(async () => {
          const r = await postComment(targetKind, targetId, body, parentId)
          if (r.ok) {
            setBody("")
            router.refresh()
          } else {
            toast.error(r.error)
          }
        })
      }
      className={compact ? "space-y-2" : "space-y-3"}
    >
      <Textarea
        rows={compact ? 1 : 3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        maxLength={1000}
        className="resize-none"
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={pending || !body.trim()} size={compact ? "sm" : "default"}>
          {pending ? "Posting…" : compact ? "Reply" : "Comment"}
        </Button>
      </div>
    </form>
  )
}
