"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import {
  approveSeller,
  deleteArtistVerification,
  deleteSellerVerificationDocs,
  reviewArtistDoc,
  reviewSellerDoc,
  setArtistVerifStatus,
  setSellerVerifStatus,
} from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// ─── Artist verification status control ──────────────────────────────────────

export function ArtistVerifControls({
  verificationId,
  currentStatus,
}: {
  verificationId: string
  currentStatus: string
}) {
  const [notes, setNotes] = useState("")
  const [pending, startTransition] = useTransition()

  const act = (status: "under_review" | "approved" | "rejected" | "resubmit_requested") =>
    startTransition(async () => {
      const r = await setArtistVerifStatus(verificationId, status, notes)
      if (r.ok) toast.success(`Status → ${status.replace("_", " ")}`)
      else toast.error(r.error)
    })

  const isApproved = currentStatus === "approved"

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <Input
        placeholder="Notes (required for reject)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="h-8 text-xs"
        disabled={isApproved}
      />
      <div className="flex flex-wrap gap-1">
        {currentStatus === "submitted" && (
          <Button size="sm" variant="outline" disabled={pending} onClick={() => act("under_review")}>
            Review
          </Button>
        )}
        <Button
          size="sm"
          disabled={pending || isApproved}
          onClick={() => act("approved")}
        >
          Approve
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={pending || !notes || isApproved}
          onClick={() => act("rejected")}
        >
          Reject
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={pending || isApproved}
          onClick={() => act("resubmit_requested")}
        >
          Resubmit
        </Button>
      </div>
    </div>
  )
}

// ─── Per-document review (artist) ─────────────────────────────────────────────

export function ReviewArtistDocControls({
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
      const r = await reviewArtistDoc(docId, status, notes)
      if (r.ok) toast.success(`Doc ${status}`)
      else toast.error(r.error)
    })

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <Input
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="h-8 text-xs"
      />
      <div className="flex gap-1">
        <Button size="sm" variant="outline" disabled={pending || currentStatus === "approved"} onClick={() => review("approved")}>
          ✓
        </Button>
        <Button size="sm" variant="ghost" disabled={pending || !notes} onClick={() => review("rejected")}>
          ✗
        </Button>
      </div>
    </div>
  )
}

// ─── Per-document review (seller) ─────────────────────────────────────────────

export function ReviewSellerDocControls({
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
      const r = await reviewSellerDoc(docId, status, notes)
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
        <Button size="sm" variant="outline" disabled={pending || currentStatus === "approved"} onClick={() => review("approved")}>
          Approve
        </Button>
        <Button size="sm" variant="ghost" disabled={pending || !notes} onClick={() => review("rejected")}>
          Reject
        </Button>
      </div>
    </div>
  )
}

// ─── Seller final approval ────────────────────────────────────────────────────

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
      {disabled ? "Verified ✓" : pending ? "Approving…" : "Approve seller"}
    </Button>
  )
}

// ─── Seller reject / resubmit ─────────────────────────────────────────────────

export function RejectSellerControls({ sellerId }: { sellerId: string }) {
  const [notes, setNotes] = useState("")
  const [pending, startTransition] = useTransition()

  const act = (status: "rejected" | "resubmit_requested") =>
    startTransition(async () => {
      const r = await setSellerVerifStatus(sellerId, status, notes)
      if (r.ok) toast.success(`Status → ${status.replace("_", " ")}`)
      else toast.error(r.error)
    })

  return (
    <div className="flex items-center gap-1">
      <Input
        placeholder="Notes (required for reject)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="h-8 w-40 text-xs"
      />
      <Button size="sm" variant="ghost" disabled={pending || !notes} onClick={() => act("rejected")}>
        Reject
      </Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => act("resubmit_requested")}>
        Resubmit
      </Button>
    </div>
  )
}

// ─── Delete artist verification ───────────────────────────────────────────────

export function DeleteArtistVerifButton({ verificationId }: { verificationId: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <Button
      size="sm"
      variant="destructive"
      disabled={pending}
      onClick={() => {
        if (!confirm("Permanently delete this artist verification? This cannot be undone.")) return
        startTransition(async () => {
          const r = await deleteArtistVerification(verificationId)
          if (r.ok) toast.success("Verification deleted")
          else toast.error(r.error)
        })
      }}
    >
      {pending ? "Deleting…" : "Delete"}
    </Button>
  )
}

// ─── Delete seller verification docs ─────────────────────────────────────────

export function DeleteSellerDocsButton({ sellerId }: { sellerId: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <Button
      size="sm"
      variant="destructive"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete all verification documents for this seller? This cannot be undone.")) return
        startTransition(async () => {
          const r = await deleteSellerVerificationDocs(sellerId)
          if (r.ok) toast.success("Documents deleted")
          else toast.error(r.error)
        })
      }}
    >
      {pending ? "Deleting…" : "Delete docs"}
    </Button>
  )
}
