"use client"

import Link from "next/link"
import { useTransition } from "react"
import { toast } from "sonner"

import { deleteEvent } from "./actions"
import { Button } from "@/components/ui/button"

export function EventRowActions({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href={`/admin/events/${id}/edit`}>Edit</Link>
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={pending}
        onClick={() => {
          if (!confirm("Delete this event?")) return
          startTransition(async () => {
            const r = await deleteEvent(id)
            if (r.ok) toast.success("Event deleted")
            else toast.error(r.error)
          })
        }}
      >
        {pending ? "Deleting…" : "Delete"}
      </Button>
    </div>
  )
}
