"use client"

import { useState, useTransition } from "react"
import { GripVertical, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { addLesson, deleteLesson } from "./actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface Lesson {
  id: string
  position: number
  title: string
  duration_sec: number | null
  is_preview: boolean
}

export function LessonsManager({ courseId, lessons }: { courseId: string; lessons: Lesson[] }) {
  const [isPreview, setIsPreview] = useState(false)
  const [adding, startAdd] = useTransition()
  const [deleting, startDelete] = useTransition()

  return (
    <Card>
      <CardHeader><CardTitle>Lessons</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {lessons.length === 0 ? (
          <p className="text-sm text-muted-foreground">No lessons yet — add your first below.</p>
        ) : (
          <ol className="space-y-2">
            {lessons.map((l) => (
              <li key={l.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <GripVertical className="size-4 shrink-0 text-muted-foreground" />
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{l.position}.</span>
                <span className="min-w-0 flex-1 truncate text-sm">{l.title}</span>
                {l.is_preview ? <Badge variant="outline" className="text-[10px]">Preview</Badge> : null}
                {l.duration_sec ? (
                  <span className="text-xs text-muted-foreground">{Math.round(l.duration_sec / 60)}m</span>
                ) : null}
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 text-destructive"
                  disabled={deleting}
                  onClick={() =>
                    startDelete(async () => {
                      const r = await deleteLesson(courseId, l.id)
                      if (!r.ok) toast.error(r.error)
                    })
                  }
                  aria-label="Delete lesson"
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ol>
        )}

        <form
          action={(fd) =>
            startAdd(async () => {
              fd.set("is_preview", isPreview ? "on" : "")
              const r = await addLesson(courseId, fd)
              if (r.ok) {
                toast.success("Lesson added")
                setIsPreview(false)
                ;(document.getElementById("add-lesson-form") as HTMLFormElement | null)?.reset()
              } else toast.error(r.error)
            })
          }
          id="add-lesson-form"
          className="space-y-3 rounded-xl border border-dashed border-border p-4"
        >
          <p className="text-sm font-medium">Add a lesson</p>
          <div className="space-y-2">
            <Label htmlFor="lesson-title">Title <span className="text-destructive">*</span></Label>
            <Input id="lesson-title" name="title" required maxLength={140} placeholder="e.g. Wet-on-wet basics" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lesson-video">Video URL</Label>
              <Input id="lesson-video" name="video_url" type="url" placeholder="https://…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson-dur">Duration (seconds)</Label>
              <Input id="lesson-dur" name="duration_sec" type="number" min={0} step={1} placeholder="600" />
            </div>
          </div>
          <Input name="description" placeholder="Short description (optional)" maxLength={500} />
          <div className="flex items-center justify-between">
            <Label className="text-sm">Free preview lesson</Label>
            <Switch checked={isPreview} onCheckedChange={setIsPreview} />
          </div>
          <Button type="submit" size="sm" disabled={adding}>
            <Plus className="size-4" /> {adding ? "Adding…" : "Add lesson"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
