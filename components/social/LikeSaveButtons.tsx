"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Bookmark, Heart } from "lucide-react"
import { toast } from "sonner"

import { toggleLike, toggleSave } from "@/lib/data/social-actions"
import type { ReactionTarget } from "@/lib/types/database"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LikeButtonProps {
  targetKind: ReactionTarget
  targetId: string
  initial: boolean
  count?: number
  isAuthed: boolean
  className?: string
  variant?: "default" | "ghost"
}

export function LikeButton({
  targetKind,
  targetId,
  initial,
  count = 0,
  isAuthed,
  className,
  variant = "ghost",
}: LikeButtonProps) {
  const router = useRouter()
  const [liked, setLiked] = useState(initial)
  const [optimisticCount, setOptimisticCount] = useState(count)
  const [pending, startTransition] = useTransition()

  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      disabled={pending}
      className={cn(className, liked && "text-rose-400")}
      onClick={() => {
        if (!isAuthed) {
          router.push(`/signin?next=${encodeURIComponent(window.location.pathname)}`)
          return
        }
        setLiked((v) => !v)
        setOptimisticCount((c) => c + (liked ? -1 : 1))
        startTransition(async () => {
          const result = await toggleLike(targetKind, targetId)
          if (!result.ok) {
            setLiked((v) => !v)
            setOptimisticCount((c) => c + (liked ? 1 : -1))
            toast.error(result.error)
          }
        })
      }}
    >
      <Heart className={cn("size-4", liked && "fill-current")} />
      {optimisticCount > 0 ? <span className="tabular-nums">{optimisticCount}</span> : null}
    </Button>
  )
}

interface SaveButtonProps {
  targetKind: ReactionTarget
  targetId: string
  initial: boolean
  isAuthed: boolean
  className?: string
}

export function SaveButton({
  targetKind,
  targetId,
  initial,
  isAuthed,
  className,
}: SaveButtonProps) {
  const router = useRouter()
  const [saved, setSaved] = useState(initial)
  const [pending, startTransition] = useTransition()

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      disabled={pending}
      className={cn(className, saved && "text-primary")}
      aria-label={saved ? "Remove from saved" : "Save"}
      onClick={() => {
        if (!isAuthed) {
          router.push(`/signin?next=${encodeURIComponent(window.location.pathname)}`)
          return
        }
        setSaved((v) => !v)
        startTransition(async () => {
          const result = await toggleSave(targetKind, targetId)
          if (!result.ok) {
            setSaved((v) => !v)
            toast.error(result.error)
          } else {
            toast.success(saved ? "Removed from saves" : "Saved")
          }
        })
      }}
    >
      <Bookmark className={cn("size-4", saved && "fill-current")} />
    </Button>
  )
}
