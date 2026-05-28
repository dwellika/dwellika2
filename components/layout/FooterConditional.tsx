"use client"

import { usePathname } from "next/navigation"
import { Footer } from "./Footer"

export function FooterConditional() {
  const pathname = usePathname()
  if (pathname === "/reels" || pathname.startsWith("/reels/")) return null
  return <Footer />
}
