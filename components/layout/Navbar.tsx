"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Heart, Search, User, Menu } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary">
            Dwellika
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/artists" className="hover:text-primary transition-colors">
              Artists
            </Link>
            <Link href="/reels" className="hover:text-primary transition-colors">
              Reels
            </Link>
            <div className="relative group">
              <button className="hover:text-primary transition-colors">Shop</button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link href="/shopping/arts" className="block px-4 py-2 hover:bg-gray-50">
                  Original Arts
                </Link>
                <Link href="/shopping/art-supplies" className="block px-4 py-2 hover:bg-gray-50">
                  Art Supplies
                </Link>
                <Link href="/shopping/decor-items" className="block px-4 py-2 hover:bg-gray-50">
                  Decor Items
                </Link>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search artworks, artists..." className="pl-10" />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild className="hidden md:flex">
              <Link href="/wishlist">
                <Heart className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/cart">
                <ShoppingCart className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="hidden md:flex">
              <Link href="/signin">
                <User className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="space-y-4">
              <Input placeholder="Search..." />
              <div className="space-y-2">
                <Link href="/artists" className="block py-2 hover:text-primary">
                  Artists
                </Link>
                <Link href="/reels" className="block py-2 hover:text-primary">
                  Reels
                </Link>
                <Link href="/shopping/arts" className="block py-2 hover:text-primary">
                  Original Arts
                </Link>
                <Link href="/shopping/art-supplies" className="block py-2 hover:text-primary">
                  Art Supplies
                </Link>
                <Link href="/shopping/decor-items" className="block py-2 hover:text-primary">
                  Decor Items
                </Link>
                <Link href="/wishlist" className="block py-2 hover:text-primary">
                  Wishlist
                </Link>
                <Link href="/signin" className="block py-2 hover:text-primary">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
