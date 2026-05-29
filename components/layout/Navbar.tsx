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
      <div className="container-page flex h-14 items-center gap-2 sm:h-16 sm:gap-3">
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

        {/* Desktop nav links */}
        <div className="ml-2 hidden md:block">
          <MainNav />
        </div>

        {/* Right action cluster */}
        <div className="ml-auto flex items-center gap-0.5 sm:gap-1.5">
          {/* Desktop search bar */}
          <CommandTrigger onOpen={() => setCmdOpen(true)} />

          {/* Mobile search icon */}
          <Button
            variant="ghost"
            size="icon"
            className="size-9 md:hidden"
            onClick={() => setCmdOpen(true)}
            aria-label="Search"
          >
            <Search className="size-[18px]" />
          </Button>

          {/* Wishlist — sm and up */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="Wishlist"
            className="hidden size-9 sm:inline-flex"
          >
            <Link href="/wishlist">
              <Heart className="size-[18px]" />
            </Link>
          </Button>

          {/* Theme toggle — sm and up */}
          <ModeToggle className="relative hidden size-9 sm:inline-flex" />

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
