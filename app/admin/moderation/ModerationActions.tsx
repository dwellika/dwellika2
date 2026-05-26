"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { moderate } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

interface ModItem {
  id: string
  title: string
  preview_url: string | null
  author: string | null
  created_at: string
  href: string | null
}

interface Props {
  surface: "artworks" | "reels" | "community_posts" | "competition_submissions"
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

  const decide = (decision: "approved" | "rejected" | "hidden") =>
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

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Card key={it.id} className={selected.has(it.id) ? "border-primary/60" : undefined}>
            <CardContent className="p-3">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
                {it.preview_url ? (
                  <Image src={it.preview_url} alt={it.title} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover" />
                ) : (
                  <div className="grid size-full place-items-center bg-muted text-xs text-muted-foreground">
                    Text post
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-start gap-2">
                <Checkbox
                  checked={selected.has(it.id)}
                  onCheckedChange={() => toggle(it.id)}
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-medium">{it.title}</p>
                  <p className="text-xs text-muted-foreground">{it.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(it.created_at).toLocaleString()}
                  </p>
                  {it.href ? (
                    <Link
                      href={it.href}
                      target="_blank"
                      className="text-xs text-primary hover:underline"
                    >
                      Preview →
                    </Link>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="sticky bottom-4">
        <CardContent className="space-y-2 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm">
              {selected.size === 0 ? "Select items to act on" : `${selected.size} selected`}
            </p>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() =>
                setSelected(selected.size === items.length ? new Set() : new Set(items.map((i) => i.id)))
              }
            >
              {selected.size === items.length ? "Clear all" : "Select all"}
            </button>
          </div>
          <Textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Admin notes (required when rejecting or hiding)"
            maxLength={500}
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
