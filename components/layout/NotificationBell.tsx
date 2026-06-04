"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Bell } from "lucide-react"

import { useUser } from "@/lib/auth/use-user"
import { Button } from "@/components/ui/button"

export function NotificationBell() {
  const { user } = useUser()
  const [count, setCount] = useState(0)

  // Depend on the stable id — useUser() returns a new object each render, so a
  // `[user]` dependency would re-run this effect (and re-fetch) every render.
  const userId = user?.id
  useEffect(() => {
    if (!userId) return

    const fetchCount = async () => {
      try {
        const res = await fetch("/api/notifications/unread-count")
        if (!res.ok) return
        const data = (await res.json()) as { count: number }
        setCount(data.count ?? 0)
      } catch {
        // network error — retry next tick
      }
    }

    void fetchCount()
    const interval = setInterval(fetchCount, 30_000)
    return () => clearInterval(interval)
  }, [userId])

  return (
    <Button
      variant="ghost"
      size="icon"
      asChild
      aria-label="Notifications"
      className="relative hidden md:inline-flex"
    >
      <Link href="/notifications">
        <Bell className="size-5" />
        {count > 0 ? (
          <span className="absolute -right-1 -top-1 grid size-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </Link>
    </Button>
  )
}
