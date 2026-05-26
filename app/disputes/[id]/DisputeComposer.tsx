"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { postDisputeMessage } from "@/lib/data/dispute-actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function DisputeComposer({ disputeId }: { disputeId: string }) {
  const router = useRouter()
  const [body, setBody] = useState("")
  const [pending, startTransition] = useTransition()

  return (
    <form
      action={() =>
        startTransition(async () => {
          const r = await postDisputeMessage(disputeId, body)
          if (r.ok) {
            setBody("")
            router.refresh()
          } else {
            toast.error(r.error)
          }
        })
      }
      className="space-y-2"
    >
      <Textarea
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Reply to the dispute thread…"
        maxLength={1500}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={pending || !body.trim()} size="sm">
          {pending ? "Sending…" : "Send"}
        </Button>
      </div>
    </form>
  )
}
