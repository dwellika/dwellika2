"use client"

import Link from "next/link"
import * as React from "react"
import {
  Brush,
  Compass,
  Film,
  GraduationCap,
  Hammer,
  Mic,
  Palette,
  Shirt,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const SHOP_CATEGORIES = [
  {
    title: "Original Artworks",
    href: "/shopping/arts",
    description: "Paintings, drawings, mixed media — directly from the artist.",
    Icon: Brush,
  },
  {
    title: "Home Decor",
    href: "/shopping/decor-items",
    description: "Vases, prints, lighting, sculptural objects.",
    Icon: Sparkles,
  },
  {
    title: "Art Supplies",
    href: "/shopping/art-supplies",
    description: "Brushes, papers, pigments — vetted by working artists.",
    Icon: Hammer,
  },
  {
    title: "Wearing Arts",
    href: "/shopping/wearing-arts",
    description: "Textiles, jewelry, hand-printed apparel.",
    Icon: Shirt,
  },
]

const LEARN_ITEMS = [
  {
    title: "Courses",
    href: "/courses",
    description: "Self-paced lessons by working artists.",
    Icon: GraduationCap,
  },
  {
    title: "Workshops",
    href: "/workshops",
    description: "Live and recorded masterclasses.",
    Icon: Mic,
  },
]

const NAV_LINKS = [
  { href: "/artists", label: "Artists", Icon: Users },
  { href: "/discover", label: "Discover", Icon: Sparkles },
  { href: "/reels", label: "Reels", Icon: Film },
  { href: "/communities", label: "Communities", Icon: Compass },
  { href: "/competitions", label: "Competitions", Icon: Trophy },
]

export function MainNav() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Palette className="mr-1.5 size-4" /> Shop
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[520px] gap-3 p-4 md:grid-cols-2">
              {SHOP_CATEGORIES.map(({ title, href, description, Icon }) => (
                <li key={href}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={href}
                      className="group flex select-none items-start gap-3 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent/40 focus:bg-accent/40"
                    >
                      <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <div className="font-medium leading-snug">{title}</div>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {description}
                        </p>
                      </div>
                    </Link>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {NAV_LINKS.map(({ href, label, Icon }) => (
          <NavigationMenuItem key={href}>
            <NavigationMenuLink asChild>
              <Link
                href={href}
                className={cn(navigationMenuTriggerStyle(), "gap-1.5")}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}

        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <GraduationCap className="mr-1.5 size-4" /> Learn
          </NavigationMenuTrigger>
          {/* Right-align so this rightmost dropdown doesn't overflow the viewport */}
          <NavigationMenuContent className="left-auto right-0">
            <ul className="grid w-[420px] gap-3 p-4 md:grid-cols-2">
              {LEARN_ITEMS.map(({ title, href, description, Icon }) => (
                <li key={href}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={href}
                      className="group flex select-none items-start gap-3 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent/40 focus:bg-accent/40"
                    >
                      <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <div className="font-medium leading-snug">{title}</div>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {description}
                        </p>
                      </div>
                    </Link>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
