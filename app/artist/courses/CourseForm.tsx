"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { createCourse, updateCourse } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

export interface CourseDefaults {
  id?: string
  title: string
  description: string
  cover_url: string
  level: string
  is_free: boolean
  price: string
  currency: string
  duration_min: string
}

const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
]

export function CourseForm({ defaults }: { defaults: CourseDefaults }) {
  const isEdit = Boolean(defaults.id)
  const [level, setLevel] = useState(defaults.level || "beginner")
  const [isFree, setIsFree] = useState(defaults.is_free)
  const [submit, setSubmit] = useState(true)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          setError(null)
          fd.set("level", level)
          fd.set("is_free", isFree ? "on" : "")
          fd.set("submit_for_review", submit ? "on" : "")
          const result = isEdit ? await updateCourse(defaults.id!, fd) : await createCourse(fd)
          if (result && !result.ok) {
            setError(result.error)
            toast.error(result.error)
          } else if (result && result.ok) {
            toast.success("Course saved")
          }
        })
      }
      className="space-y-6"
    >
      <Card>
        <CardHeader><CardTitle>Course details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
            <Input id="title" name="title" required maxLength={140} defaultValue={defaults.title} />
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
              <Label>Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="block">Free course</Label>
            <Switch checked={isFree} onCheckedChange={setIsFree} />
          </div>
          {!isFree && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" name="price" type="number" min={0} step="0.01" defaultValue={defaults.price} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" name="currency" defaultValue={defaults.currency || "INR"} />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="duration_min">Total duration (minutes, optional)</Label>
            <Input id="duration_min" name="duration_min" type="number" min={0} step={1} defaultValue={defaults.duration_min} />
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <Label className="block">Submit for review</Label>
              <p className="text-xs text-muted-foreground">Off = private draft. Submitted courses are reviewed before listing.</p>
            </div>
            <Switch checked={submit} onCheckedChange={setSubmit} />
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create & add lessons"}
        </Button>
      </div>
    </form>
  )
}
