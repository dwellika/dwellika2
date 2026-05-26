import type { ReactNode } from "react"
import Link from "next/link"

import { requireAuth } from "@/lib/auth/rbac"

const NAV = [
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/account", label: "Account" },
  { href: "/settings/security", label: "Security" },
  { href: "/settings/notifications", label: "Notifications" },
]

export default async function SettingsLayout({ children }: { children: ReactNode }) {
  await requireAuth()

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="font-display text-4xl">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your Dwellika account, profile, and preferences.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="md:sticky md:top-24 md:self-start">
          <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="min-w-0">{children}</section>
      </div>
    </div>
  )
}
