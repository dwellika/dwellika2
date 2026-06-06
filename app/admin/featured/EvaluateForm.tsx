"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { evaluateFeatured } from "./actions"
import { computeFeatureScore } from "./score"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const FIELDS = [
  { key: "quality", label: "Quality", weight: "30%" },
  { key: "engagement", label: "Engagement", weight: "20%" },
  { key: "sales", label: "Sales", weight: "15%" },
  { key: "freshness", label: "Freshness", weight: "15%" },
  { key: "diversity", label: "Diversity", weight: "10%" },
  { key: "curator", label: "Curator boost", weight: "10%" },
] as const

type Key = (typeof FIELDS)[number]["key"]

export function EvaluateForm({ submissionId }: { submissionId: string }) {
  const [scores, setScores] = useState<Record<Key, number>>({
    quality: 0, engagement: 0, sales: 0, freshness: 0, diversity: 0, curator: 0,
  })
  const [notes, setNotes] = useState("")
  const [pending, startTransition] = useTransition()

  const preview = computeFeatureScore(scores)

  const submit = (decision: "featured" | "rejected") =>
    startTransition(async () => {
      const r = await evaluateFeatured(submissionId, scores, decision, notes)
      if (r.ok) toast.success(`${decision === "featured" ? "Featured" : "Rejected"} · score ${r.score.toFixed(1)}`)
      else toast.error(r.error)
    })

  return (
    <div className="space-y-3 rounded-xl border border-border p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-1">
            <Label className="text-xs">{f.label} <span className="text-muted-foreground">({f.weight})</span></Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={scores[f.key]}
              onChange={(e) => setScores((s) => ({ ...s, [f.key]: Number(e.target.value) }))}
              className="h-8"
            />
          </div>
        ))}
      </div>

      <Input
        placeholder="Notes (shown to artist on reject)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="h-8 text-xs"
      />

      <div className="flex items-center justify-between">
        <p className="text-sm">
          Feature Score: <span className="font-semibold tabular-nums">{preview.toFixed(1)}</span>
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => submit("rejected")}>
            Reject
          </Button>
          <Button size="sm" disabled={pending} onClick={() => submit("featured")}>
            Feature
          </Button>
        </div>
      </div>
    </div>
  )
}
