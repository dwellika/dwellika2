"use client"

import { useTransition } from "react"
import { CheckCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { markAllNotificationsRead } from "./actions"

export function MarkAllReadButton() {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      variant="outline"
      onClick={() => startTransition(() => markAllNotificationsRead().then(() => {}))}
      disabled={pending}
    >
      <CheckCheck className="size-4" /> Mark all read
    </Button>
  )
}
