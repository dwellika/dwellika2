"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { clearArtistOfWeek, computeArtistScore, setArtistOfWeek } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const FIELDS = [
  { key: "portfolio", label: "Portfolio quality", weight: "35%" },
  { key: "engagement", label: "Engagement growth", weight: "20%" },
  { key: "collection", label: "Collection performance", weight: "15%" },
  { key: "freshness", label: "Freshness / activity", weight: "10%" },
  { key: "storytelling", label: "Storytelling", weight: "10%" },
  { key: "diversity", label: "Diversity / discovery", weight: "10%" },
] as const

type Key = (typeof FIELDS)[number]["key"]

export function ArtistOfWeekManager({
  current,
}: {
  current: { name: string | null; username: string | null; score: number | null } | null
}) {
  const [username, setUsername] = useState("")
  const [scores, setScores] = useState<Record<Key, number>>({
    portfolio: 0, engagement: 0, collection: 0, freshness: 0, storytelling: 0, diversity: 0,
  })
  const [pending, startTransition] = useTransition()
  const preview = computeArtistScore(scores)

  return (
    <div className="space-y-4">
      {current ? (
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
          <p className="text-sm">
            Current: <span className="font-medium">{current.name ?? `@${current.username}`}</span>
            {current.score != null ? <span className="text-muted-foreground"> · score {current.score.toFixed(1)}</span> : null}
          </p>
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const r = await clearArtistOfWeek()
                if (r.ok) toast.success("Cleared")
                else toast.error(r.error)
              })
            }
          >
            Clear
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No artist of the week set.</p>
      )}

      <div className="space-y-3 rounded-xl border border-dashed border-border p-4">
        <div className="space-y-1.5">
          <Label htmlFor="aow-username">Artist username</Label>
          <Input id="aow-username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. priya_sharma" className="max-w-xs" />
        </div>
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
        <div className="flex items-center justify-between">
          <p className="text-sm">Artist Score: <span className="font-semibold tabular-nums">{preview.toFixed(1)}</span></p>
          <Button
            size="sm"
            disabled={pending || !username.trim()}
            onClick={() =>
              startTransition(async () => {
                const r = await setArtistOfWeek(username, scores)
                if (r.ok) { toast.success("Artist of the week set"); setUsername("") }
                else toast.error(r.error)
              })
            }
          >
            Set as Artist of the Week
          </Button>
        </div>
      </div>
    </div>
  )
}
