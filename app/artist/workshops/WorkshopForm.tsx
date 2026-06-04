"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { createWorkshop, updateWorkshop } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export interface WorkshopDefaults {
  id?: string
  title: string
  description: string
  cover_url: string
  starts_at: string // datetime-local value
  ends_at: string
  is_live: boolean
  meeting_url: string
  recording_url: string
  price: string
  currency: string
  capacity: string
}

export function WorkshopForm({ defaults }: { defaults: WorkshopDefaults }) {
  const isEdit = Boolean(defaults.id)
  const [isLive, setIsLive] = useState(defaults.is_live)
  const [submit, setSubmit] = useState(true)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          setError(null)
          fd.set("is_live", isLive ? "on" : "")
          fd.set("submit_for_review", submit ? "on" : "")
          const result = isEdit
            ? await updateWorkshop(defaults.id!, fd)
            : await createWorkshop(fd)
          if (result && !result.ok) {
            setError(result.error)
            toast.error(result.error)
          }
        })
      }
      className="space-y-6"
    >
      <Card>
        <CardHeader><CardTitle>Workshop details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
            <Input id="title" name="title" required maxLength={120} defaultValue={defaults.title} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={4} maxLength={2000} defaultValue={defaults.description} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cover_url">Cover image URL</Label>
            <Input id="cover_url" name="cover_url" type="url" placeholder="https://…" defaultValue={defaults.cover_url} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Schedule & access</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="starts_at">Starts at <span className="text-destructive">*</span></Label>
              <Input id="starts_at" name="starts_at" type="datetime-local" required defaultValue={defaults.starts_at} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ends_at">Ends at <span className="text-destructive">*</span></Label>
              <Input id="ends_at" name="ends_at" type="datetime-local" required defaultValue={defaults.ends_at} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="block">Live session</Label>
              <p className="text-xs text-muted-foreground">Off = pre-recorded masterclass.</p>
            </div>
            <Switch checked={isLive} onCheckedChange={setIsLive} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="meeting_url">Meeting link (Zoom / Meet)</Label>
              <Input id="meeting_url" name="meeting_url" type="url" placeholder="https://…" defaultValue={defaults.meeting_url} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recording_url">Recording URL (optional)</Label>
              <Input id="recording_url" name="recording_url" type="url" placeholder="https://…" defaultValue={defaults.recording_url} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Pricing & capacity</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">Price (0 = free)</Label>
              <Input id="price" name="price" type="number" min={0} step="0.01" defaultValue={defaults.price} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" name="currency" defaultValue={defaults.currency || "INR"} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (optional)</Label>
              <Input id="capacity" name="capacity" type="number" min={1} step={1} defaultValue={defaults.capacity} />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <Label className="block">Submit for review</Label>
              <p className="text-xs text-muted-foreground">
                Off = save as private draft. Submitted workshops are reviewed before listing.
              </p>
            </div>
            <Switch checked={submit} onCheckedChange={setSubmit} />
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Saving…" : isEdit ? "Save changes" : submit ? "Submit for review" : "Save draft"}
        </Button>
      </div>
    </form>
  )
}
