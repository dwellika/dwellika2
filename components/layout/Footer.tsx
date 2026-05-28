import Link from "next/link"
import { Github, Instagram, Twitter, Youtube } from "lucide-react"

import { SmartImage } from "@/components/ui/smart-image"
import { Separator } from "@/components/ui/separator"

import { NewsletterForm } from "./NewsletterForm"

const COLUMNS = [
  {
    title: "Discover",
    items: [
      { label: "AI search", href: "/discover" },
      { label: "Original Artworks", href: "/shopping/arts" },
      { label: "Art Supplies", href: "/shopping/art-supplies" },
      { label: "Home Decor", href: "/shopping/decor-items" },
      { label: "Wearing Arts", href: "/shopping/wearing-arts" },
      { label: "Artists", href: "/artists" },
      { label: "Collections", href: "/collections" },
      { label: "Communities", href: "/communities" },
      { label: "Competitions", href: "/competitions" },
      { label: "Reels", href: "/reels" },
      { label: "Courses", href: "/courses" },
      { label: "Workshops", href: "/workshops" },
    ],
  },
  {
    title: "Create",
    items: [
      { label: "Upload Artwork", href: "/artist/dashboard" },
      { label: "Sell on Dwellika", href: "/sellers/join" },
      { label: "Host a Workshop", href: "/workshops/host" },
      { label: "Reels Studio", href: "/reels/studio" },
      { label: "Creator Fund", href: "/creator-fund" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Help",
    items: [
      { label: "Help Center", href: "/help" },
      { label: "Shipping & Returns", href: "/help/shipping" },
      { label: "Buyer Protection", href: "/help/buyer-protection" },
      { label: "Seller Verification", href: "/sellers/verification" },
      { label: "Trust & Safety", href: "/trust" },
    ],
  },
]

const LEGAL = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Cookies", href: "/cookies" },
  { label: "Accessibility", href: "/accessibility" },
]

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="container-page py-10 lg:py-16">
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="relative size-9 overflow-hidden rounded-md">
                <SmartImage
                  src="/images/brand/logo.svg"
                  alt="Dwellika"
                  kind="generic"
                  seed="Dwellika"
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </span>
              <span className="font-display text-2xl">Dwellika</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              A museum-grade marketplace and social platform for artists,
              collectors, and the people who keep the studios running.
            </p>

            <div className="mt-6">
              <p className="mb-2 text-sm font-medium">Get the dispatch</p>
              <NewsletterForm />
            </div>

            <div className="mt-8 flex items-center gap-3">
              {[
                { Icon: Instagram, href: "https://instagram.com", label: "Instagram" },
                { Icon: Twitter, href: "https://twitter.com", label: "Twitter" },
                { Icon: Youtube, href: "https://youtube.com", label: "YouTube" },
                { Icon: Github, href: "https://github.com", label: "GitHub" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="grid size-9 place-items-center rounded-full border border-border bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                  aria-label={label}
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="mb-3 text-sm font-medium">{col.title}</p>
                <ul className="space-y-2">
                  {col.items.map((it) => (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {it.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-start justify-between gap-3 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Dwellika. Crafted with care.</p>
          <ul className="flex flex-wrap items-center gap-4">
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
