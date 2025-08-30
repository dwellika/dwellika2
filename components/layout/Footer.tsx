import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Dwellika</h3>
            <p className="text-gray-300 mb-4">
              Connecting art lovers with talented artists worldwide. Discover unique artworks and support creative
              communities.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 hover:text-blue-400 cursor-pointer" />
              <Instagram className="w-5 h-5 hover:text-pink-400 cursor-pointer" />
              <Twitter className="w-5 h-5 hover:text-blue-400 cursor-pointer" />
              <Mail className="w-5 h-5 hover:text-green-400 cursor-pointer" />
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <div className="space-y-2">
              <Link href="/shopping/arts" className="block text-gray-300 hover:text-white">
                Original Arts
              </Link>
              <Link href="/shopping/art-supplies" className="block text-gray-300 hover:text-white">
                Art Supplies
              </Link>
              <Link href="/shopping/decor-items" className="block text-gray-300 hover:text-white">
                Decor Items
              </Link>
            </div>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <div className="space-y-2">
              <Link href="/artists" className="block text-gray-300 hover:text-white">
                Artists
              </Link>
              <Link href="/reels" className="block text-gray-300 hover:text-white">
                Art Reels
              </Link>
              <Link href="#" className="block text-gray-300 hover:text-white">
                Blog
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <div className="space-y-2">
              <Link href="#" className="block text-gray-300 hover:text-white">
                Help Center
              </Link>
              <Link href="#" className="block text-gray-300 hover:text-white">
                Shipping Info
              </Link>
              <Link href="#" className="block text-gray-300 hover:text-white">
                Returns
              </Link>
              <Link href="#" className="block text-gray-300 hover:text-white">
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        <hr className="my-8 border-gray-700" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300">© 2024 Dwellika. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="text-gray-300 hover:text-white">
              Privacy Policy
            </Link>
            <Link href="#" className="text-gray-300 hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
