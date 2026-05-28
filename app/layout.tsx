import type { Metadata, Viewport } from "next"
import { Inter, Manrope, Plus_Jakarta_Sans } from "next/font/google"
import type { ReactNode } from "react"

import "./globals.css"

import { FooterConditional } from "@/components/layout/FooterConditional"
import { Navbar } from "@/components/layout/Navbar"
import { InstallPrompt } from "@/components/pwa/InstallPrompt"
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Providers } from "@/components/providers"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" })
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dwellika — A living museum for artists and collectors",
    template: "%s · Dwellika",
  },
  description:
    "Discover originals, watch artists at work, join craft communities, and collect from a curated global gallery.",
  keywords: [
    "art marketplace",
    "artists",
    "collectors",
    "watercolor",
    "sculpture",
    "digital art",
    "reels",
    "Dwellika",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Dwellika",
    title: "Dwellika — A living museum for artists and collectors",
    description:
      "Discover originals, watch artists at work, join craft communities, and collect from a curated global gallery.",
    images: ["/placeholder.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dwellika",
    description:
      "Discover originals, watch artists at work, join craft communities, and collect from a curated global gallery.",
    images: ["/placeholder.svg"],
  },
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF4E6" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1612" },
  ],
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={cn(inter.variable, manrope.variable, jakarta.variable)}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <Providers>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>

          <TooltipProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <FooterConditional />
            </div>
          </TooltipProvider>
          <Toaster />
          <InstallPrompt />
          <ServiceWorkerRegister />
        </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
