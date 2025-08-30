import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Mail } from "lucide-react"

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/brand/logo.png"
                alt="Dwellika logo"
                width={36}
                height={36}
                className="rounded-sm"
                priority
              />
              <h3 className="text-2xl font-bold text-white">Dwellika</h3>
            </div>
            <p className="text-slate-400">
              The art of dwelling well. Discover unique pieces from creators and artisans around the world.
            </p>
            <div className="flex items-center gap-4 mt-5 text-slate-400">
              <a href="#" aria-label="Facebook" className="hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Instagram" className="hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Twitter" className="hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="mailto:hello@dwellika.com" aria-label="Email" className="hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-white mb-4 tracking-tight">Shop</h4>
            <nav className="space-y-2">
              <Link href="/shopping/arts" className="block text-slate-400 hover:text-white transition-colors">
                Original Arts
              </Link>
              <Link href="/shopping/art-supplies" className="block text-slate-400 hover:text-white transition-colors">
                Art Supplies
              </Link>
              <Link href="/shopping/decor-items" className="block text-slate-400 hover:text-white transition-colors">
                Decor Items
              </Link>
            </nav>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold text-white mb-4 tracking-tight">Community</h4>
            <nav className="space-y-2">
              <Link href="/artists" className="block text-slate-400 hover:text-white transition-colors">
                Artists
              </Link>
              <Link href="/reels" className="block text-slate-400 hover:text-white transition-colors">
                Art Reels
              </Link>
              <Link href="#" className="block text-slate-400 hover:text-white transition-colors">
                Blog
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4 tracking-tight">Support</h4>
            <nav className="space-y-2">
              <Link href="#" className="block text-slate-400 hover:text-white transition-colors">
                Help Center
              </Link>
              <Link href="#" className="block text-slate-400 hover:text-white transition-colors">
                Shipping Info
              </Link>
              <Link href="#" className="block text-slate-400 hover:text-white transition-colors">
                Returns
              </Link>
              <Link href="#" className="block text-slate-400 hover:text-white transition-colors">
                Contact Us
              </Link>
            </nav>
          </div>
        </div>

        <hr className="my-10 border-slate-800" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400">{`© ${year} Dwellika. All rights reserved.`}</p>
          <div className="flex gap-6">
            <Link href="#" className="text-slate-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-slate-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
