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
  BadgeCheck,
  ShieldQuestion,
  CalendarDays,
  LayoutDashboard,
} from "lucide-react"

import { requireRole } from "@/lib/auth/rbac"

const NAV = [
  { href: "/admin",              label: "Overview",      Icon: Gauge,       superAdminOnly: false },
  { href: "/admin/analytics",    label: "Analytics",     Icon: BarChart3,   superAdminOnly: false },
  { href: "/admin/moderation",   label: "Moderation",    Icon: ShieldCheck, superAdminOnly: false },
  { href: "/admin/verifications",label: "Verifications", Icon: BadgeCheck,  superAdminOnly: false },
  { href: "/admin/featured",     label: "Featured",      Icon: Sparkles,    superAdminOnly: false },
  { href: "/admin/disputes",     label: "Disputes",      Icon: ShieldAlert, superAdminOnly: false },
  { href: "/admin/orders",       label: "Orders",        Icon: ShoppingBag, superAdminOnly: false },
  { href: "/admin/users",        label: "Users",         Icon: Users,       superAdminOnly: false },
  { href: "/admin/communities",  label: "Communities",   Icon: Users2,      superAdminOnly: false },
  { href: "/admin/competitions", label: "Competitions",  Icon: Trophy,      superAdminOnly: false },
  { href: "/admin/events",       label: "Events",        Icon: CalendarDays, superAdminOnly: false },
  { href: "/admin/homepage",     label: "Homepage",      Icon: LayoutDashboard, superAdminOnly: false },
  { href: "/admin/admins",       label: "Admins",        Icon: ShieldQuestion, superAdminOnly: true },
] as const

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("admin", "super_admin")
  const isSuperAdmin = user.role === "super_admin"
  const nav = NAV.filter((n) => !n.superAdminOnly || isSuperAdmin)

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
            {nav.map(({ href, label, Icon }) => (
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
