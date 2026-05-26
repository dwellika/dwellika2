"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Check } from "lucide-react"
import { toast } from "sonner"

import { registerWorkshop } from "@/lib/data/learning-actions"
import { Button } from "@/components/ui/button"

interface Props {
  workshopId: string
  initialRegistered: boolean
  isAuthed: boolean
  isPast: boolean
}

export function RegisterWorkshopButton({
  workshopId,
  initialRegistered,
  isAuthed,
  isPast,
}: Props) {
  const router = useRouter()
  const [registered, setRegistered] = useState(initialRegistered)
  const [pending, startTransition] = useTransition()

  if (isPast) {
    return (
      <Button size="lg" className="w-full" disabled>
        Workshop has ended
      </Button>
    )
  }

  if (registered) {
    return (
      <Button size="lg" variant="outline" className="w-full" disabled>
        <Check className="size-4" /> You&apos;re registered
      </Button>
    )
  }

  return (
    <Button
      size="lg"
      className="w-full"
      disabled={pending}
      onClick={() => {
        if (!isAuthed) {
          router.push(`/signin?next=${encodeURIComponent(window.location.pathname)}`)
          return
        }
        startTransition(async () => {
          const r = await registerWorkshop(workshopId)
          if (r && !r.ok) toast.error(r.error)
          else {
            setRegistered(true)
            toast.success("You're registered. We'll send the link 30 minutes before.")
          }
        })
      }}
    >
      {pending ? "Reserving…" : "Reserve a seat"}
    </Button>
  )
}
