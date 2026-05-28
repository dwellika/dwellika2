"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useTransition } from "react"
import {
  Brush,
  Compass,
  Film,
  GraduationCap,
  Hammer,
  Heart,
  LogOut,
  Menu,
  MessageSquare,
  Mic,
  Palette,
  Settings,
  ShoppingBag,
  Shirt,
  Sparkles,
  Trophy,
  User2,
  Users,
} from "lucide-react"

import { signOutAction } from "@/app/(auth)/actions"
import { useUser } from "@/lib/auth/use-user"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { ModeToggle } from "./ModeToggle"

const NAV_SECTIONS = [
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
    Icon: Compass,
    items: [
      { label: "AI Search", href: "/discover", Icon: Sparkles },
      { label: "Artists", href: "/artists", Icon: Users },
      { label: "Reels", href: "/reels", Icon: Film },
      { label: "Communities", href: "/communities", Icon: Compass },
      { label: "Competitions", href: "/competitions", Icon: Trophy },
    ],
  },
  {
    label: "Learn",
    Icon: GraduationCap,
    items: [
      { label: "Courses", href: "/courses", Icon: GraduationCap },
      { label: "Workshops", href: "/workshops", Icon: Mic },
    ],
  },
]

const ACCOUNT_LINKS = [
  { label: "My Profile", href: "profile", Icon: User2 },
  { label: "Orders", href: "/orders", Icon: ShoppingBag },
  { label: "Wishlist", href: "/wishlist", Icon: Heart },
  { label: "Messages", href: "/messages", Icon: MessageSquare },
  { label: "Settings", href: "/settings/profile", Icon: Settings },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const pathname = usePathname()
  const { user } = useUser()

  const close = () => setOpen(false)

  const initials =
    user?.full_name
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ??
    user?.email?.slice(0, 2).toUpperCase() ??
    "DW"

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0 md:hidden" aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="flex w-[280px] flex-col gap-0 p-0 sm:w-[300px]">
        {/* Header */}
        <SheetHeader className="flex flex-row items-center justify-between border-b border-border/60 px-5 py-4">
          <SheetTitle asChild>
            <Link
              href="/"
              onClick={close}
              className="font-display text-xl tracking-tight"
            >
              Dwellika
            </Link>
          </SheetTitle>
          <ModeToggle className="relative" />
        </SheetHeader>

        {/* User / Auth section */}
        {user ? (
          <div className="border-b border-border/60 px-4 py-3">
            <Link
              href={`/u/${user.username ?? ""}`}
              onClick={close}
              className="-mx-2 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
            >
              <Avatar className="size-10 shrink-0">
                <AvatarImage src={user.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-tight">
                  {user.full_name ?? user.username ?? "My Account"}
                </p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </Link>
          </div>
        ) : (
          <div className="flex gap-2 border-b border-border/60 px-4 py-3">
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link href="/signin" onClick={close}>Sign in</Link>
            </Button>
            <Button size="sm" asChild className="flex-1">
              <Link href="/signup" onClick={close}>Join free</Link>
            </Button>
          </div>
        )}

        {/* Scrollable navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: "none" }}>
          <div className="space-y-5">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label}>
                <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  {section.label}
                </p>
                <ul className="space-y-0.5">
                  {section.items.map(({ label, href, Icon }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={close}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive(href)
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/75 hover:bg-muted/50 hover:text-foreground",
                        )}
                      >
                        <Icon className={cn("size-4 shrink-0", isActive(href) ? "text-primary" : "text-muted-foreground")} />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Account links for logged-in users */}
            {user && (
              <div>
                <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Account
                </p>
                <ul className="space-y-0.5">
                  {ACCOUNT_LINKS.map(({ label, href, Icon }) => {
                    const finalHref =
                      href === "profile" ? `/u/${user.username ?? ""}` : href
                    return (
                      <li key={label}>
                        <Link
                          href={finalHref}
                          onClick={close}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isActive(finalHref)
                              ? "bg-primary/10 text-primary"
                              : "text-foreground/75 hover:bg-muted/50 hover:text-foreground",
                          )}
                        >
                          <Icon className={cn("size-4 shrink-0", isActive(finalHref) ? "text-primary" : "text-muted-foreground")} />
                          {label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
        </nav>

        {/* Sign out footer */}
        {user && (
          <div className="border-t border-border/60 px-4 py-3">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  close()
                  await signOutAction()
                })
              }
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
            >
              <LogOut className="size-4 shrink-0" />
              {pending ? "Signing out…" : "Sign out"}
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
