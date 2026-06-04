"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { createEvent, updateEvent } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export interface EventDefaults {
  id?: string
  kind: string
  title: string
  description: string
  cover_url: string
  location: string
  starts_at: string
  ends_at: string
  url: string
  is_published: boolean
  is_featured: boolean
}

const KINDS = [
  { value: "competition", label: "Competition" },
  { value: "workshop", label: "Workshop" },
  { value: "exhibition", label: "Exhibition" },
  { value: "other", label: "Other" },
]

export function EventForm({ defaults }: { defaults: EventDefaults }) {
  const isEdit = Boolean(defaults.id)
  const [kind, setKind] = useState(defaults.kind || "exhibition")
  const [published, setPublished] = useState(defaults.is_published)
  const [featured, setFeatured] = useState(defaults.is_featured)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          setError(null)
          fd.set("kind", kind)
          fd.set("is_published", published ? "on" : "")
          fd.set("is_featured", featured ? "on" : "")
          const r = isEdit ? await updateEvent(defaults.id!, fd) : await createEvent(fd)
          if (r && !r.ok) { setError(r.error); toast.error(r.error) }
        })
      }
      className="space-y-6"
    >
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
              <Input id="title" name="title" required maxLength={140} defaultValue={defaults.title} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={kind} onValueChange={setKind}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {KINDS.map((k) => <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={4} maxLength={2000} defaultValue={defaults.description} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cover_url">Cover image URL</Label>
              <Input id="cover_url" name="cover_url" type="url" placeholder="https://…" defaultValue={defaults.cover_url} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="City / venue / Online" defaultValue={defaults.location} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="starts_at">Starts at</Label>
              <Input id="starts_at" name="starts_at" type="datetime-local" defaultValue={defaults.starts_at} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ends_at">Ends at</Label>
              <Input id="ends_at" name="ends_at" type="datetime-local" defaultValue={defaults.ends_at} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">External link (optional)</Label>
            <Input id="url" name="url" type="url" placeholder="https://…" defaultValue={defaults.url} />
          </div>

          <div className="flex flex-wrap gap-6 border-t border-border pt-4">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={published} onCheckedChange={setPublished} /> Published
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={featured} onCheckedChange={setFeatured} /> Featured
            </label>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create event"}
        </Button>
      </div>
    </form>
  )
}
