"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Award } from "lucide-react"
import { toast } from "sonner"

import { enrollInCourse } from "@/lib/data/learning-actions"
import { Button } from "@/components/ui/button"

interface Props {
  courseId: string
  enrolled: boolean
  isAuthed: boolean
  isFree: boolean
  completed: boolean
}

export function EnrollButton({ courseId, enrolled, isAuthed, isFree, completed }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  if (completed) {
    return (
      <Button size="lg" variant="outline" className="w-full" disabled>
        <Award className="size-4" /> Course completed
      </Button>
    )
  }

  if (enrolled) {
    return (
      <Button size="lg" className="w-full" disabled>
        Continue watching below
      </Button>
    )
  }

  return (
    <Button
      size="lg"
      className="w-full"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          if (!isAuthed) {
            router.push(`/signin?next=${encodeURIComponent(window.location.pathname)}`)
            return
          }
          const r = await enrollInCourse(courseId)
          if (r && !r.ok) toast.error(r.error)
          else {
            toast.success(isFree ? "Enrolled" : "Enrolled (paid courses go through checkout in next phase)")
            router.refresh()
          }
        })
      }
    >
      {pending ? "Enrolling…" : isFree ? "Enroll free" : "Enroll"}
    </Button>
  )
}
