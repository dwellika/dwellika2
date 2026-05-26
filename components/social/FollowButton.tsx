"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Check, UserPlus } from "lucide-react"
import { toast } from "sonner"

import { toggleFollow } from "@/lib/data/social-actions"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FollowButtonProps {
  targetUserId: string
  initial: boolean
  size?: "default" | "sm" | "lg"
  variant?: "default" | "outline" | "ghost"
  isAuthed: boolean
  className?: string
}

export function FollowButton({
  targetUserId,
  initial,
  size = "default",
  variant = "default",
  isAuthed,
  className,
}: FollowButtonProps) {
  const router = useRouter()
  const [following, setFollowing] = useState(initial)
  const [pending, startTransition] = useTransition()

  const onClick = () => {
    if (!isAuthed) {
      router.push(`/signin?next=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    setFollowing((v) => !v) // optimistic
    startTransition(async () => {
      const result = await toggleFollow(targetUserId)
      if (!result.ok) {
        setFollowing((v) => !v)
        toast.error(result.error)
      } else if (result.state) {
        toast.success("Following")
      }
    })
  }

  return (
    <Button
      type="button"
      size={size}
      variant={following ? "outline" : variant}
      disabled={pending}
      onClick={onClick}
      className={cn(className)}
    >
      {following ? (
        <>
          <Check className="size-4" /> Following
        </>
      ) : (
        <>
          <UserPlus className="size-4" /> Follow
        </>
      )}
    </Button>
  )
}
