"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, Lock, PlayCircle } from "lucide-react"
import { toast } from "sonner"

import { markLessonComplete } from "@/lib/data/learning-actions"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LessonRowProps {
  lesson: {
    id: string
    course_id: string
    position: number
    title: string
    description: string | null
    video_url: string | null
    duration_sec: number | null
    is_preview: boolean
  }
  enrolled: boolean
  completed: boolean
  isAuthed: boolean
}

export function LessonRow({ lesson, enrolled, completed, isAuthed }: LessonRowProps) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [isCompleted, setIsCompleted] = useState(completed)

  const canWatch = lesson.is_preview || enrolled
  const minutes = lesson.duration_sec ? Math.max(1, Math.round(lesson.duration_sec / 60)) : null

  return (
    <div className="space-y-3 px-4 py-3">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => canWatch && setOpen((v) => !v)}
          disabled={!canWatch}
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-full",
            isCompleted ? "bg-emerald-500/20 text-emerald-300" : "bg-primary/15 text-primary",
            !canWatch && "opacity-40",
          )}
        >
          {isCompleted ? (
            <CheckCircle2 className="size-5" />
          ) : canWatch ? (
            <PlayCircle className="size-5" />
          ) : (
            <Lock className="size-4" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {String(lesson.position).padStart(2, "0")}
            </span>
            <p className={cn("font-medium", !canWatch && "text-muted-foreground")}>
              {lesson.title}
            </p>
            {lesson.is_preview ? (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] uppercase tracking-widest text-primary">
                Preview
              </span>
            ) : null}
          </div>
          {lesson.description ? (
            <p className="line-clamp-1 text-xs text-muted-foreground">{lesson.description}</p>
          ) : null}
        </div>
        {minutes ? (
          <p className="shrink-0 text-xs text-muted-foreground">{minutes} min</p>
        ) : null}
      </div>

      {open && canWatch ? (
        <div className="space-y-3 pl-12">
          {lesson.video_url ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={lesson.video_url}
              controls
              className="w-full rounded-xl"
              onEnded={() => {
                if (!isAuthed || !enrolled || isCompleted) return
                startTransition(async () => {
                  const r = await markLessonComplete(
                    lesson.id,
                    lesson.course_id,
                    lesson.duration_sec ?? 0,
                  )
                  if (r.ok) {
                    setIsCompleted(true)
                    toast.success("Lesson completed")
                  } else {
                    toast.error(r.error)
                  }
                })
              }}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              The instructor hasn&apos;t uploaded video for this lesson yet.
            </div>
          )}
          {enrolled && !isCompleted ? (
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const r = await markLessonComplete(
                    lesson.id,
                    lesson.course_id,
                    lesson.duration_sec ?? 0,
                  )
                  if (r.ok) {
                    setIsCompleted(true)
                    toast.success("Lesson completed")
                  } else {
                    toast.error(r.error)
                  }
                })
              }
            >
              {pending ? "Saving…" : "Mark complete"}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
