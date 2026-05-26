"use client"

import { useState, useTransition } from "react"
import { Paperclip, X } from "lucide-react"
import { toast } from "sonner"

import { openDispute } from "@/lib/data/dispute-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const REASONS = [
  { value: "not_received", label: "Item not received" },
  { value: "damaged", label: "Item arrived damaged" },
  { value: "not_as_described", label: "Item not as described" },
  { value: "wrong_item", label: "Wrong item shipped" },
  { value: "missing_parts", label: "Missing parts or accessories" },
  { value: "quality", label: "Quality issue" },
  { value: "seller_unresponsive", label: "Seller is unresponsive" },
  { value: "other", label: "Other" },
]

export function NewDisputeForm({ orderId }: { orderId: string }) {
  const [files, setFiles] = useState<File[]>([])
  const [reason, setReason] = useState("")
  const [pending, startTransition] = useTransition()

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          fd.set("order_id", orderId)
          fd.set("reason", reason)
          for (const f of files) fd.append("evidence", f)
          const r = await openDispute(fd)
          if (r && !r.ok) toast.error(r.error)
        })
      }
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <input type="hidden" name="reason" value={reason} />
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger>
            <SelectValue placeholder="Select a reason…" />
          </SelectTrigger>
          <SelectContent>
            {REASONS.map((r) => (
              <SelectItem key={r.value} value={r.label}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Describe the issue</Label>
        <Textarea
          id="description"
          name="description"
          rows={6}
          maxLength={2000}
          placeholder="Share the timeline, what you expected, and what you received."
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Evidence</Label>
        {files.length > 0 ? (
          <ul className="space-y-1">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm"
              >
                <Paperclip className="size-3.5 text-muted-foreground" />
                <span className="flex-1 truncate">{f.name}</span>
                <button
                  type="button"
                  onClick={() => setFiles((arr) => arr.filter((_, idx) => idx !== i))}
                  aria-label="Remove"
                >
                  <X className="size-3.5 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <Label
          htmlFor="evidence"
          className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border bg-muted/20 px-3 py-2 text-sm hover:bg-muted/40"
        >
          <Paperclip className="size-3.5" /> Add photos / PDFs
        </Label>
        <Input
          id="evidence"
          type="file"
          multiple
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => {
            const next = Array.from(e.target.files ?? [])
            setFiles((prev) => [...prev, ...next].slice(0, 6))
          }}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={pending || !reason}>
          {pending ? "Submitting…" : "Open dispute"}
        </Button>
      </div>
    </form>
  )
}
