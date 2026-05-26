"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Check, Plus } from "lucide-react"
import { toast } from "sonner"

import { joinCommunity, leaveCommunity } from "@/lib/data/community-actions"
import { Button } from "@/components/ui/button"

export function JoinButton({
  communityId,
  initialJoined,
  isAuthed,
}: {
  communityId: string
  initialJoined: boolean
  isAuthed: boolean
}) {
  const router = useRouter()
  const [joined, setJoined] = useState(initialJoined)
  const [pending, startTransition] = useTransition()

  return (
    <Button
      type="button"
      variant={joined ? "outline" : "default"}
      disabled={pending}
      onClick={() => {
        if (!isAuthed) {
          router.push(`/signin?next=${encodeURIComponent(window.location.pathname)}`)
          return
        }
        setJoined((v) => !v)
        startTransition(async () => {
          const fn = joined ? leaveCommunity : joinCommunity
          const result = await fn(communityId)
          if (!result.ok) {
            setJoined((v) => !v)
            toast.error(result.error)
          } else {
            toast.success(joined ? "Left community" : "Joined community")
          }
        })
      }}
    >
      {joined ? <><Check className="size-4" /> Joined</> : <><Plus className="size-4" /> Join</>}
    </Button>
  )
}
