"use client"

import Link from "next/link"
import { useTransition } from "react"
import { toast } from "sonner"

import { deleteCourse } from "./actions"
import { Button } from "@/components/ui/button"

export function CourseRowActions({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href={`/artist/courses/${id}/edit`}>Edit</Link>
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={pending}
        onClick={() => {
          if (!confirm("Delete this course and all its lessons? This cannot be undone.")) return
          startTransition(async () => {
            const r = await deleteCourse(id)
            if (r.ok) toast.success("Course deleted")
            else toast.error(r.error)
          })
        }}
      >
        {pending ? "Deleting…" : "Delete"}
      </Button>
    </div>
  )
}
