import { auth } from "@/lib/auth/edge-config"
import { NextResponse } from "next/server"

// Routes that require a specific role
const ADMIN_PREFIXES = ["/admin"]
const ARTIST_PREFIXES = ["/artist/dashboard"]
const SELLER_PREFIXES = ["/seller/dashboard"]

// Routes that require any authenticated session
const AUTH_REQUIRED = [
  "/settings",
  "/checkout",
  "/orders",
  "/messages",
  "/disputes",
  "/notifications",
  "/wishlist",
  "/sold",
  "/cart",
]

export default auth(function middleware(req) {
  const { pathname } = req.nextUrl
  const user = req.auth?.user
  const role = user?.role ?? null

  const isAdmin = role === "admin" || role === "super_admin"
  const isArtist = isAdmin || role === "artist"
  const isSeller = isAdmin || role === "seller" || role === "artist"

  // Admin-only routes
  if (ADMIN_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!isAdmin) {
      const dest = user ? "/403" : `/signin?next=${encodeURIComponent(pathname)}`
      return NextResponse.redirect(new URL(dest, req.url))
    }
  }

  // Artist dashboard
  if (ARTIST_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!isArtist) {
      const dest = user ? "/403" : `/signin?next=${encodeURIComponent(pathname)}`
      return NextResponse.redirect(new URL(dest, req.url))
    }
  }

  // Seller dashboard
  if (SELLER_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!isSeller) {
      const dest = user ? "/403" : `/signin?next=${encodeURIComponent(pathname)}`
      return NextResponse.redirect(new URL(dest, req.url))
    }
  }

  // Any authenticated route
  if (AUTH_REQUIRED.some((p) => pathname.startsWith(p))) {
    if (!user) {
      return NextResponse.redirect(
        new URL(`/signin?next=${encodeURIComponent(pathname)}`, req.url),
      )
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Run middleware on all routes EXCEPT:
     * - Next.js internals (_next/static, _next/image)
     * - NextAuth API routes (api/auth) — handled by NextAuth itself
     * - Static files (svg, png, jpg, etc.)
     * - PWA manifest/service worker assets
     */
    "/((?!_next/static|_next/image|api/auth|favicon.ico|manifest.json|sitemap.xml|robots.txt|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
