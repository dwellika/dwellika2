import { auth } from "@/lib/auth/edge-config"
import { NextResponse } from "next/server"

const ADMIN_PREFIXES = ["/admin"]
const ARTIST_PREFIXES = ["/artist/dashboard"]
const SELLER_PREFIXES = ["/seller/dashboard"]
const AUTH_REQUIRED = ["/settings", "/checkout", "/orders", "/messages", "/disputes", "/notifications"]

export default auth(function middleware(req) {
  const { pathname } = req.nextUrl
  const user = req.auth?.user
  const role = user?.role ?? null

  const isAdmin = role === "admin" || role === "super_admin"
  const isArtist = isAdmin || role === "artist"
  const isSeller = isAdmin || role === "seller" || role === "artist"

  if (ADMIN_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!isAdmin) {
      return user
        ? NextResponse.redirect(new URL("/403", req.url))
        : NextResponse.redirect(new URL(`/signin?next=${encodeURIComponent(pathname)}`, req.url))
    }
  }

  if (ARTIST_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!isArtist) {
      return user
        ? NextResponse.redirect(new URL("/403", req.url))
        : NextResponse.redirect(new URL(`/signin?next=${encodeURIComponent(pathname)}`, req.url))
    }
  }

  if (SELLER_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!isSeller) {
      return user
        ? NextResponse.redirect(new URL("/403", req.url))
        : NextResponse.redirect(new URL(`/signin?next=${encodeURIComponent(pathname)}`, req.url))
    }
  }

  if (AUTH_REQUIRED.some((p) => pathname.startsWith(p))) {
    if (!user) {
      return NextResponse.redirect(new URL(`/signin?next=${encodeURIComponent(pathname)}`, req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
