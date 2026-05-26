"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { resolveDispute } from "@/lib/data/dispute-actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function ResolveControls({ disputeId }: { disputeId: string }) {
  const [open, setOpen] = useState(false)
  const [outcome, setOutcome] = useState<"resolved" | "rejected">("resolved")
  const [resolution, setResolution] = useState("")
  const [pending, startTransition] = useTransition()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Resolve</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve dispute</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              variant={outcome === "resolved" ? "default" : "outline"}
              size="sm"
              onClick={() => setOutcome("resolved")}
            >
              In buyer favor
            </Button>
            <Button
              variant={outcome === "rejected" ? "default" : "outline"}
              size="sm"
              onClick={() => setOutcome("rejected")}
            >
              In seller favor
            </Button>
          </div>
          <Textarea
            rows={4}
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="Final note. Sent to both parties as a notification."
            maxLength={1000}
          />
          <div className="flex justify-end">
            <Button
              disabled={pending || !resolution.trim()}
              onClick={() =>
                startTransition(async () => {
                  const r = await resolveDispute(disputeId, resolution, outcome)
                  if (r.ok) {
                    toast.success("Dispute closed")
                    setOpen(false)
                  } else {
                    toast.error(r.error)
                  }
                })
              }
            >
              {pending ? "Closing…" : "Close dispute"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
