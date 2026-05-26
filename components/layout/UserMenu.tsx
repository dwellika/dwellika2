"use client"

import Link from "next/link"
import { LogOut, MessageSquare, Settings, ShieldAlert, ShoppingBag, Heart, User2 } from "lucide-react"
import { useEffect, useState, useTransition } from "react"

import { signOut } from "@/app/(auth)/actions"
import { useUser } from "@/lib/auth/use-user"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LevelBadge } from "@/components/badges/TierBadge"
import type { UserLevel } from "@/lib/types/database"

export function UserMenu() {
  const { user, loading } = useUser()
  const [pending, startTransition] = useTransition()
  const [level, setLevel] = useState<{ level: UserLevel; xp: number } | null>(null)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from("user_levels")
      .select("level, xp")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setLevel((data as { level: UserLevel; xp: number } | null) ?? { level: "explorer", xp: 0 })
      })
  }, [user])

  if (loading) {
    return <div className="h-9 w-24 animate-pulse rounded-md bg-muted/40" />
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href="/signin">Sign in</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Join Dwellika</Link>
        </Button>
      </div>
    )
  }

  const initials =
    user.full_name
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? user.email?.slice(0, 2).toUpperCase() ?? "DW"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full ring-offset-background transition-shadow hover:ring-2 hover:ring-primary/40 hover:ring-offset-2"
        >
          <Avatar className="size-9">
            <AvatarImage src={user.avatar_url ?? undefined} alt={user.username ?? ""} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="font-medium text-foreground">{user.full_name ?? user.username}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
          {level ? (
            <div className="mt-2 flex items-center justify-between text-xs">
              <LevelBadge level={level.level} />
              <span className="tabular-nums text-muted-foreground">
                {level.xp.toLocaleString()} XP
              </span>
            </div>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.username ? (
          <DropdownMenuItem asChild>
            <Link href={`/u/${user.username}`}>
              <User2 className="size-4" /> View profile
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem asChild>
          <Link href="/settings/profile">
            <Settings className="size-4" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/orders">
            <ShoppingBag className="size-4" /> Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/messages">
            <MessageSquare className="size-4" /> Messages
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/wishlist">
            <Heart className="size-4" /> Wishlist
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/disputes">
            <ShieldAlert className="size-4" /> Disputes
          </Link>
        </DropdownMenuItem>
        {user.role === "artist" ? (
          <DropdownMenuItem asChild>
            <Link href="/artist/dashboard">Artist dashboard</Link>
          </DropdownMenuItem>
        ) : null}
        {user.role === "seller" ? (
          <DropdownMenuItem asChild>
            <Link href="/seller/dashboard">Seller dashboard</Link>
          </DropdownMenuItem>
        ) : null}
        {(user.role === "admin" || user.role === "super_admin") ? (
          <DropdownMenuItem asChild>
            <Link href="/admin">Admin console</Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={pending}
          onSelect={(e) => {
            e.preventDefault()
            startTransition(async () => {
              await signOut()
            })
          }}
        >
          <LogOut className="size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
