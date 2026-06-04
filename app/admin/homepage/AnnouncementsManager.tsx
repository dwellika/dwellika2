"use client"

import { useState, useTransition } from "react"
import { Pin, PinOff, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { createAnnouncement, deleteAnnouncement, toggleAnnouncementPin } from "./actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export interface AnnouncementItem {
  id: string
  category: string
  title: string
  is_pinned: boolean
}

const CATEGORIES = ["event", "workshop", "course", "notification"]

export function AnnouncementsManager({ items }: { items: AnnouncementItem[] }) {
  const [category, setCategory] = useState("notification")
  const [pending, startTransition] = useTransition()

  return (
    <div className="space-y-4">
      {items.length > 0 && (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {items.map((a) => (
            <li key={a.id} className="flex items-center gap-2 p-3">
              <Badge variant="outline" className="capitalize">{a.category}</Badge>
              <span className="min-w-0 flex-1 truncate text-sm">{a.title}</span>
              {a.is_pinned ? <Badge className="bg-primary/15 text-primary">Pinned</Badge> : null}
              <Button
                size="icon" variant="ghost" className="size-8" disabled={pending}
                onClick={() => startTransition(async () => {
                  const r = await toggleAnnouncementPin(a.id, !a.is_pinned)
                  if (!r.ok) toast.error(r.error)
                })}
                aria-label="Toggle pin"
              >
                {a.is_pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
              </Button>
              <Button
                size="icon" variant="ghost" className="size-8 text-destructive" disabled={pending}
                onClick={() => startTransition(async () => {
                  const r = await deleteAnnouncement(a.id)
                  if (!r.ok) toast.error(r.error)
                })}
                aria-label="Delete"
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form
        action={(fd) => startTransition(async () => {
          fd.set("category", category)
          const r = await createAnnouncement(fd)
          if (r.ok) { toast.success("Announcement added"); (document.getElementById("ann-form") as HTMLFormElement | null)?.reset() }
          else toast.error(r.error)
        })}
        id="ann-form"
        className="space-y-3 rounded-xl border border-dashed border-border p-4"
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <div className="space-y-1.5">
            <Label htmlFor="ann-title">Title <span className="text-destructive">*</span></Label>
            <Input id="ann-title" name="title" required maxLength={140} />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Textarea name="body" rows={2} maxLength={500} placeholder="Body (optional)" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Input name="cta_label" placeholder="CTA label (optional)" />
          <Input name="cta_url" type="url" placeholder="CTA URL (optional)" />
          <Input name="image_url" type="url" placeholder="Image URL (optional)" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_pinned" className="size-4" /> Pin to top
        </label>
        <Button type="submit" size="sm" disabled={pending}><Plus className="size-4" /> Add announcement</Button>
      </form>
    </div>
  )
}
