"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function NotificationBell() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null

    const setup = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user || cancelled) return

      // Initial count
      const { count: c } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .is("read_at", null)
      if (!cancelled) setCount(c ?? 0)

      // Subscribe to inserts on this user's notifications
      channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const row = payload.new as { title?: string; body?: string | null; action_url?: string | null }
            setCount((c) => c + 1)
            toast(row.title ?? "New notification", {
              description: row.body ?? undefined,
              action: row.action_url
                ? {
                    label: "Open",
                    onClick: () => {
                      window.location.href = row.action_url!
                    },
                  }
                : undefined,
            })
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            // when something gets marked read, refresh
            supabase
              .from("notifications")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id)
              .is("read_at", null)
              .then(({ count: c }) => {
                if (!cancelled) setCount(c ?? 0)
              })
          },
        )
        .subscribe()
    }

    setup()

    return () => {
      cancelled = true
      if (channel) channel.unsubscribe()
    }
  }, [])

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
