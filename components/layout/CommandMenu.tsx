"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Brush,
  Compass,
  Film,
  GraduationCap,
  Hammer,
  MessageSquare,
  Mic,
  Search,
  Settings,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

interface CommandMenuProps {
  open: boolean
  onOpenChange: (next: boolean) => void
}

const NAV_ITEMS = [
  { label: "AI search", href: "/discover", Icon: Sparkles },
  { label: "Explore Art", href: "/shopping/arts", Icon: Brush },
  { label: "Home Decor", href: "/shopping/decor-items", Icon: Sparkles },
  { label: "Art Supplies", href: "/shopping/art-supplies", Icon: Hammer },
  { label: "Collections", href: "/collections", Icon: Sparkles },
  { label: "Artists", href: "/artists", Icon: Users },
  { label: "Reels", href: "/reels", Icon: Film },
  { label: "Communities", href: "/communities", Icon: Compass },
  { label: "Competitions", href: "/competitions", Icon: Trophy },
  { label: "Courses", href: "/courses", Icon: GraduationCap },
  { label: "Workshops", href: "/workshops", Icon: Mic },
  { label: "Cart", href: "/cart", Icon: ShoppingBag },
]

const ACCOUNT_ITEMS = [
  { label: "Profile settings", href: "/settings/profile", Icon: Settings },
  { label: "My orders", href: "/orders", Icon: ShoppingBag },
  { label: "Messages", href: "/messages", Icon: MessageSquare },
  { label: "Disputes", href: "/disputes", Icon: ShieldAlert },
]

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onOpenChange])

  const go = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search artists, artworks, communities…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {NAV_ITEMS.map(({ label, href, Icon }) => (
            <CommandItem key={href} onSelect={() => go(href)}>
              <Icon className="size-4" /> {label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Account">
          {ACCOUNT_ITEMS.map(({ label, href, Icon }) => (
            <CommandItem key={href} onSelect={() => go(href)}>
              <Icon className="size-4" /> {label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Shortcuts">
          <CommandItem onSelect={() => go("/signin")}>
            Sign in <CommandShortcut>⇧⏎</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

export function CommandTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      type="button"
      className="hidden h-9 w-full max-w-xs items-center gap-2 rounded-full border border-border bg-muted/30 px-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/50 md:inline-flex"
    >
      <Search className="size-4" />
      <span>Search Dwellika…</span>
      <kbd className="ml-auto rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
        ⌘K
      </kbd>
    </button>
  )
}
