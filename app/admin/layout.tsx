import type { ReactNode } from "react"
import Link from "next/link"
import {
  BarChart3,
  Gauge,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trophy,
  Users,
  Users2,
} from "lucide-react"

import { requireRole } from "@/lib/auth/rbac"

const NAV = [
  { href: "/admin", label: "Overview", Icon: Gauge },
  { href: "/admin/analytics", label: "Analytics", Icon: BarChart3 },
  { href: "/admin/moderation", label: "Moderation", Icon: ShieldCheck },
  { href: "/admin/sellers", label: "Seller verification", Icon: ShoppingBag },
  { href: "/admin/disputes", label: "Disputes", Icon: ShieldAlert },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingBag },
  { href: "/admin/users", label: "Users", Icon: Users },
  { href: "/admin/communities", label: "Communities", Icon: Users2 },
  { href: "/admin/competitions", label: "Competitions", Icon: Trophy },
] as const

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole("admin", "super_admin")

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <p className="text-xs uppercase tracking-[0.25em] text-primary">
          Admin console
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
            {NAV.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
              >
                <Icon className="size-4" /> {label}
              </Link>
            ))}
          </nav>
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  )
}
