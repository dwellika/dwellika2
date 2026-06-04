"use client"

import Link from "next/link"
import { BadgeCheck, LogOut, MessageSquare, Settings, ShieldAlert, ShoppingBag, Store, Heart, User2, UserCircle2 } from "lucide-react"
import { useEffect, useState } from "react"
import { signOut } from "next-auth/react"

import { useUser } from "@/lib/auth/use-user"
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
  const [level, setLevel] = useState<{ level: UserLevel; xp: number } | null>(null)

  // Depend on the stable user id, not the `user` object — useUser() returns a
  // fresh object every render, so depending on `user` re-runs this effect on
  // every render (and setLevel re-renders), causing an infinite fetch loop.
  const userId = user?.id
  useEffect(() => {
    if (!userId) return
    fetch(`/api/user/${userId}/level`)
      .then((r) => r.ok ? r.json() : null)
      .then((data: { level: UserLevel; xp: number } | null) => {
        if (data) setLevel(data)
      })
      .catch(() => { })
  }, [userId])

  if (loading) {
    return <div className="h-9 w-24 animate-pulse rounded-md bg-muted/40" />
  }

  if (!user) {
    return (
      <div className="flex shrink-0 items-center gap-1">
        {/* xs / small phones: single icon → sign in page */}
        <Button variant="ghost" size="icon" asChild className="size-9 sm:hidden" aria-label="Sign in">
          <Link href="/signin">
            <UserCircle2 className="size-[18px]" />
          </Link>
        </Button>

        {/* Separate "Sign in" link only appears once there is room (lg+).
            Below lg it is merged into the single "Join Dwellika" CTA. */}
        <Button variant="ghost" size="sm" asChild className="hidden lg:inline-flex">
          <Link href="/signin">Sign in</Link>
        </Button>
        <Button size="sm" asChild className="hidden whitespace-nowrap sm:inline-flex">
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
        {/* Verification entry points — hidden once the user already holds the role */}
        {!["artist", "admin", "super_admin"].includes(user.role) ? (
          <DropdownMenuItem asChild>
            <Link href="/verify/artist">
              <BadgeCheck className="size-4" /> Verify as artist
            </Link>
          </DropdownMenuItem>
        ) : null}
        {!["seller", "admin", "super_admin"].includes(user.role) ? (
          <DropdownMenuItem asChild>
            <Link href="/verify/seller">
              <Store className="size-4" /> Verify as seller
            </Link>
          </DropdownMenuItem>
        ) : null}
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
          onSelect={(e) => {
            e.preventDefault()
            signOut({ callbackUrl: "/" })
          }}
        >
          <LogOut className="size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
