"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { submitToFeatured } from "./actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function SubmitFeaturedButton({
  artworkId,
  status,
}: {
  artworkId: string
  status: string | null
}) {
  const [open, setOpen] = useState(false)
  const [pitch, setPitch] = useState("")
  const [pending, startTransition] = useTransition()

  if (status === "pending") {
    return <span className="text-xs font-medium text-amber-500">Under review</span>
  }
  if (status === "featured") {
    return <span className="text-xs font-medium text-emerald-500">Featured ✓</span>
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          {status === "rejected" ? "Resubmit" : "Submit to featured"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit to the Featured collection</DialogTitle>
          <DialogDescription>
            Our curation team scores submissions on quality, engagement, sales, freshness, diversity
            and curator fit. Tell us why this piece deserves a spotlight.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="pitch">Your pitch (optional)</Label>
          <Textarea
            id="pitch"
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            rows={4}
            maxLength={600}
            placeholder="What makes this work special?"
          />
        </div>
        <DialogFooter>
          <Button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const r = await submitToFeatured(artworkId, pitch)
                if (r.ok) {
                  toast.success("Submitted for curation")
                  setOpen(false)
                } else toast.error(r.error)
              })
            }
          >
            {pending ? "Submitting…" : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
