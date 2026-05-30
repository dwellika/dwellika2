"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { moderate, type Decision, type Surface } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

export interface ModItem {
  id: string
  title: string
  preview_url: string | null
  author: string | null
  created_at: string
  href: string | null
  extra?: string | null
}

interface Props {
  surface: Surface
  items: ModItem[]
}

export function ModerationActions({ surface, items }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState("")
  const [pending, startTransition] = useTransition()

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const decide = (decision: Decision) =>
    startTransition(async () => {
      const r = await moderate(surface, Array.from(selected), decision, notes)
      if (r.ok) {
        toast.success(`${selected.size} item(s) ${decision}`)
        setSelected(new Set())
        setNotes("")
      } else {
        toast.error(r.error)
      }
    })

  const allSelected = selected.size === items.length

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Card key={it.id} className={selected.has(it.id) ? "border-primary/60 ring-1 ring-primary/30" : undefined}>
            <CardContent className="p-3">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-muted">
                {it.preview_url ? (
                  <Image
                    src={it.preview_url}
                    alt={it.title}
                    fill
                    sizes="(max-width:768px) 50vw, 25vw"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="grid size-full place-items-center text-xs text-muted-foreground">
                    No preview
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-start gap-2">
                <Checkbox
                  checked={selected.has(it.id)}
                  onCheckedChange={() => toggle(it.id)}
                  className="mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium">{it.title}</p>
                  <p className="text-xs text-muted-foreground">{it.author}</p>
                  {it.extra ? (
                    <p className="text-xs text-muted-foreground">{it.extra}</p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    {new Date(it.created_at).toLocaleString()}
                  </p>
                  {it.href ? (
                    <Link href={it.href} target="_blank" className="text-xs text-primary hover:underline">
                      Preview →
                    </Link>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sticky action bar */}
      <Card className="sticky bottom-4 z-10">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {selected.size === 0
                ? "Select items to act on"
                : `${selected.size} of ${items.length} selected`}
            </p>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setSelected(allSelected ? new Set() : new Set(items.map((i) => i.id)))}
            >
              {allSelected ? "Clear all" : "Select all"}
            </button>
          </div>

          <Textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Admin notes — required for reject, hide, and delete"
            maxLength={500}
            className="resize-none"
          />

          <div className="flex flex-wrap gap-2">
            <Button
              disabled={pending || selected.size === 0}
              onClick={() => decide("approved")}
            >
              Approve {selected.size > 0 ? `(${selected.size})` : ""}
            </Button>

            <Button
              variant="outline"
              disabled={pending || selected.size === 0 || !notes.trim()}
              onClick={() => decide("rejected")}
            >
              Reject
            </Button>

            <Button
              variant="ghost"
              disabled={pending || selected.size === 0 || !notes.trim()}
              onClick={() => decide("hidden")}
            >
              Hide
            </Button>

            <Button
              variant="destructive"
              disabled={pending || selected.size === 0 || !notes.trim()}
              onClick={() => {
                if (!confirm(`Permanently delete ${selected.size} item(s)? This cannot be undone.`)) return
                decide("deleted")
              }}
            >
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
