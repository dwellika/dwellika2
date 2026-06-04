"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { Heart, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SmartImage } from "@/components/ui/smart-image"
import { cn } from "@/lib/utils"

import { CartIndicator } from "./CartIndicator"
import { CommandTrigger } from "./CommandTrigger"
import { MainNav } from "./MainNav"
import { MobileNav } from "./MobileNav"
import { ModeToggle } from "./ModeToggle"

// Deferred until after hydration — they make API calls and don't affect LCP
const CommandMenu = dynamic(
  () => import("./CommandMenu").then((m) => ({ default: m.CommandMenu })),
  { ssr: false },
)
const NotificationBell = dynamic(
  () => import("./NotificationBell").then((m) => ({ default: m.NotificationBell })),
  { ssr: false },
)
const UserMenu = dynamic(
  () => import("./UserMenu").then((m) => ({ default: m.UserMenu })),
  {
    ssr: false,
    loading: () => <div className="h-9 w-24 animate-pulse rounded-md bg-muted/40" />,
  },
)

export function Navbar() {
  const [cmdOpen, setCmdOpen] = useState(false)
  const pathname = usePathname()
  const isReels = pathname === "/reels" || pathname.startsWith("/reels/")

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl",
        isReels && "max-md:hidden",
      )}
    >
      {/* Full-viewport-width row (no max-width cap) so the nav, search bar and
          actions spread across the whole header instead of crowding a 1280px column. */}
      <div className="flex h-14 w-full items-center gap-2 px-4 sm:h-16 sm:gap-3 sm:px-6 lg:px-8">
        {/* Hamburger — mobile/tablet only */}
        <MobileNav />

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="relative size-7 overflow-hidden rounded-md sm:size-8">
            <SmartImage
              src="/images/brand/logo.svg"
              alt="Dwellika"
              kind="generic"
              seed="Dwellika"
              fill
              sizes="32px"
              className="object-cover"
            />
          </span>
          <span className="font-display text-lg tracking-tight sm:text-xl">Dwellika</span>
        </Link>

        {/* Desktop nav links — the full 7-item bar only fits from xl up; below that
            the hamburger menu is used instead (see MobileNav). */}
        <div className="ml-2 hidden xl:block">
          <MainNav />
        </div>

        {/* Right action cluster — natural width, right-aligned. (No flex-1: a
            squeezed flex-1 search bar was spilling over the icons.) */}
        <div className="ml-auto flex min-w-0 items-center justify-end gap-0.5 sm:gap-1.5">
          {/* Desktop search bar — fixed width, only on very wide screens */}
          <CommandTrigger onOpen={() => setCmdOpen(true)} />

          {/* Compact search icon — used until the full search bar appears at 2xl */}
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 2xl:hidden"
            onClick={() => setCmdOpen(true)}
            aria-label="Search"
          >
            <Search className="size-[18px]" />
          </Button>

          {/* Wishlist — md and up */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="Wishlist"
            className="hidden size-9 md:inline-flex"
          >
            <Link href="/wishlist">
              <Heart className="size-[18px]" />
            </Link>
          </Button>

          {/* Theme toggle — md and up */}
          <ModeToggle className="relative hidden size-9 md:inline-flex" />

          {/* Notification bell — md and up (handled inside component too) */}
          <NotificationBell />

          {/* Cart — always visible */}
          <CartIndicator />

          {/* User menu */}
          <UserMenu />
        </div>
      </div>

      <CommandMenu open={cmdOpen} onOpenChange={setCmdOpen} />
    </header>
  )
}
