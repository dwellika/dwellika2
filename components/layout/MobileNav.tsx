"use client"

import Link from "next/link"
import { useState } from "react"
import {
  Brush,
  Compass,
  Film,
  GraduationCap,
  Hammer,
  Menu,
  Mic,
  Palette,
  Shirt,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { ModeToggle } from "./ModeToggle"

const SECTIONS = [
  {
    label: "Shop",
    Icon: Palette,
    items: [
      { label: "Original Artworks", href: "/shopping/arts", Icon: Brush },
      { label: "Home Decor", href: "/shopping/decor-items", Icon: Sparkles },
      { label: "Art Supplies", href: "/shopping/art-supplies", Icon: Hammer },
      { label: "Wearing Arts", href: "/shopping/wearing-arts", Icon: Shirt },
    ],
  },
  {
    label: "Discover",
    items: [
      { label: "AI search", href: "/discover", Icon: Sparkles },
      { label: "Artists", href: "/artists", Icon: Users },
      { label: "Collections", href: "/collections", Icon: Sparkles },
      { label: "Reels", href: "/reels", Icon: Film },
      { label: "Communities", href: "/communities", Icon: Compass },
      { label: "Competitions", href: "/competitions", Icon: Trophy },
    ],
  },
  {
    label: "Learn",
    items: [
      { label: "Courses", href: "/courses", Icon: GraduationCap },
      { label: "Workshops", href: "/workshops", Icon: Mic },
    ],
  },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle className="font-display text-2xl">Dwellika</SheetTitle>
          <ModeToggle className="relative" />
        </SheetHeader>

        <nav className="mt-6 space-y-6">
          {SECTIONS.map((s) => (
            <div key={s.label}>
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {s.label}
              </p>
              <ul className="space-y-1">
                {s.items.map((it) => (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted/40"
                    >
                      <it.Icon className="size-4 text-muted-foreground" />
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
