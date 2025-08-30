"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/brand/logo.png"
            alt="Dwellika logo"
            width={36}
            height={36}
            priority
            className="rounded-sm"
          />
          <span className="font-semibold tracking-tight text-lg">Dwellika</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/(pages)/artists">Artists</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/(pages)/shopping/arts">Shop</Link>
          </Button>
          <Button className="bg-primary text-primary-foreground hover:opacity-90">Get Updates</Button>
        </div>
      </div>
    </header>
  )
}
