"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { approveSeller, reviewVerificationDoc } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ReviewDocControls({
  docId,
  currentStatus,
}: {
  docId: string
  currentStatus: string
}) {
  const [notes, setNotes] = useState("")
  const [pending, startTransition] = useTransition()

  const review = (status: "approved" | "rejected" | "resubmit") =>
    startTransition(async () => {
      const r = await reviewVerificationDoc(docId, status, notes)
      if (r.ok) toast.success(`Marked ${status}`)
      else toast.error(r.error)
    })

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <Input
        placeholder="Notes (required for reject)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="h-8 text-xs"
      />
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          disabled={pending || currentStatus === "approved"}
          onClick={() => review("approved")}
        >
          Approve
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={pending || !notes}
          onClick={() => review("rejected")}
        >
          Reject
        </Button>
      </div>
    </div>
  )
}

export function ApproveSellerButton({
  sellerId,
  disabled,
}: {
  sellerId: string
  disabled: boolean
}) {
  const [pending, startTransition] = useTransition()

  return (
    <Button
      disabled={pending || disabled}
      onClick={() =>
        startTransition(async () => {
          const r = await approveSeller(sellerId)
          if (r.ok) toast.success("Seller verified")
          else toast.error(r.error)
        })
      }
    >
      {disabled ? "Verified" : pending ? "Approving…" : "Approve seller"}
    </Button>
  )
}
