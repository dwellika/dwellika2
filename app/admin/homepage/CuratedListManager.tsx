"use client"

import { useState, useTransition } from "react"
import { Plus, X } from "lucide-react"
import { toast } from "sonner"

import { promoteToSection, removeFeature } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export interface FeatureItem {
  id: string
  username: string | null
  name: string | null
}

export function CuratedListManager({
  section,
  label,
  hint,
  items,
}: {
  section: "trending_artists" | "best_studio"
  label: string
  hint: string
  items: FeatureItem[]
}) {
  const [username, setUsername] = useState("")
  const [pending, startTransition] = useTransition()

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{hint}</p>

      {items.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {items.map((it) => (
            <li key={it.id} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/30 py-1 pl-3 pr-1.5 text-sm">
              <span>{it.name ?? `@${it.username}`}</span>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const r = await removeFeature(it.id)
                    if (r.ok) toast.success("Removed")
                    else toast.error(r.error)
                  })
                }
                className="grid size-5 place-items-center rounded-full text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                aria-label="Remove"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Nothing pinned — the section falls back to automatic ranking.</p>
      )}

      <form
        action={() =>
          startTransition(async () => {
            const r = await promoteToSection(section, username)
            if (r.ok) { toast.success(`Promoted to ${label}`); setUsername("") }
            else toast.error(r.error)
          })
        }
        className="flex max-w-sm gap-2"
      >
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username to promote"
          className="h-9"
        />
        <Button type="submit" size="sm" disabled={pending || !username.trim()}>
          <Plus className="size-4" /> Promote
        </Button>
      </form>
    </div>
  )
}
