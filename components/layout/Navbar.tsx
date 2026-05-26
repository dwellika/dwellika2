"use client"

import Link from "next/link"
import { useState } from "react"
import { Heart, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SmartImage } from "@/components/ui/smart-image"

import { CartIndicator } from "./CartIndicator"
import { CommandMenu, CommandTrigger } from "./CommandMenu"
import { MainNav } from "./MainNav"
import { MobileNav } from "./MobileNav"
import { ModeToggle } from "./ModeToggle"
import { NotificationBell } from "./NotificationBell"
import { UserMenu } from "./UserMenu"

export function Navbar() {
  const [cmdOpen, setCmdOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center gap-4">
        <MobileNav />

        <Link href="/" className="flex items-center gap-2">
          <span className="relative size-8 overflow-hidden rounded-md">
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
          <span className="font-display text-xl tracking-tight">Dwellika</span>
        </Link>

        <div className="ml-2 hidden md:block">
          <MainNav />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <CommandTrigger onOpen={() => setCmdOpen(true)} />

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setCmdOpen(true)}
            aria-label="Search"
          >
            <Search className="size-5" />
          </Button>

          <Button variant="ghost" size="icon" asChild aria-label="Wishlist">
            <Link href="/wishlist"><Heart className="size-5" /></Link>
          </Button>

          <ModeToggle className="relative hidden sm:inline-flex" />

          <NotificationBell />

          <CartIndicator />

          <div className="ml-1">
            <UserMenu />
          </div>
        </div>
      </div>

      <CommandMenu open={cmdOpen} onOpenChange={setCmdOpen} />
    </header>
  )
}
