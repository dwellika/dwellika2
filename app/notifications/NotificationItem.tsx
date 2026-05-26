"use client"

import Link from "next/link"
import { useTransition } from "react"
import {
  Bell,
  Heart,
  MessageCircle,
  Package,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

import { markNotificationRead } from "./actions"

const ICONS = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  mention: Users,
  order_update: Package,
  competition_update: Trophy,
  community_invite: Users,
  system: Bell,
} as const

interface NotificationItemProps {
  notification: {
    id: string
    kind: keyof typeof ICONS
    title: string
    body: string | null
    action_url: string | null
    read_at: string | null
    created_at: string
    actor: { username: string | null; full_name: string | null; avatar_url: string | null } | null
  }
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const Icon = ICONS[notification.kind] ?? Bell
  const [pending, startTransition] = useTransition()

  const onClick = () => {
    if (notification.read_at) return
    startTransition(async () => {
      await markNotificationRead(notification.id)
    })
  }

  const inner = (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition-colors",
        !notification.read_at && "border-primary/30 bg-primary/5",
      )}
    >
      {notification.actor?.avatar_url ? (
        <Avatar className="size-10">
          <AvatarImage src={notification.actor.avatar_url} />
          <AvatarFallback>
            {(notification.actor.full_name ?? notification.actor.username ?? "?").slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="grid size-10 place-items-center rounded-full bg-primary/15 text-primary">
          <Icon className="size-5" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{notification.title}</p>
        {notification.body ? (
          <p className="text-sm text-muted-foreground">{notification.body}</p>
        ) : null}
        <p className="mt-1 text-xs text-muted-foreground">
          {new Date(notification.created_at).toLocaleString()}
        </p>
      </div>

      {!notification.read_at ? (
        <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
      ) : null}
    </div>
  )

  if (notification.action_url) {
    return (
      <li>
        <Link href={notification.action_url} onClick={onClick} aria-busy={pending}>
          {inner}
        </Link>
      </li>
    )
  }

  return (
    <li>
      <button type="button" onClick={onClick} className="w-full text-left">
        {inner}
      </button>
    </li>
  )
}
