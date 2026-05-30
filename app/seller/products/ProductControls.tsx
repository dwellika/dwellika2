"use client"

import { useState, useTransition } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  deleteProductAction,
  submitProductAction,
  updateInventoryAction,
} from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// ─── Inventory inline update ──────────────────────────────────────────────────

export function InventoryControl({
  productId,
  current,
}: {
  productId: string
  current:   number
}) {
  const [value, setValue] = useState(String(current))
  const [pending, startTransition] = useTransition()

  function save() {
    const next = Math.max(0, parseInt(value, 10) || 0)
    startTransition(async () => {
      const r = await updateInventoryAction(productId, next)
      if (r.ok) toast.success("Inventory updated")
      else toast.error(r.error)
    })
  }

  return (
    <div className="flex items-center gap-1.5">
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); save() } }}
        className="h-7 w-20 text-xs"
        aria-label="Inventory quantity"
        disabled={pending}
      />
      {pending && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
    </div>
  )
}

// ─── Submit for review ────────────────────────────────────────────────────────

export function SubmitForReviewButton({ productId }: { productId: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const r = await submitProductAction(productId)
          if (r.ok) toast.success("Submitted for review")
          else toast.error(r.error)
        })
      }
    >
      {pending ? <Loader2 className="size-3.5 animate-spin" /> : "Submit"}
    </Button>
  )
}

// ─── Delete product ───────────────────────────────────────────────────────────

export function DeleteProductButton({ productId }: { productId: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-destructive hover:text-destructive"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this product? This cannot be undone.")) return
        startTransition(async () => {
          const r = await deleteProductAction(productId)
          if (r.ok) toast.success("Product deleted")
          else toast.error(r.error)
        })
      }}
      aria-label="Delete product"
    >
      <Trash2 className="size-4" />
    </Button>
  )
}
