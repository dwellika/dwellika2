import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import { requireRole } from "@/lib/auth/rbac"
import { prisma } from "@/lib/prisma"

export const metadata = { title: "Admin · Communities" }

export default async function AdminCommunitiesPage() {
  await requireRole("admin", "super_admin")

  const rows = await prisma.community.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      member_count: true,
      is_private: true,
      created_at: true,
    },
    orderBy: { created_at: "desc" },
  })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl">Communities</h1>
        <p className="mt-1 text-muted-foreground">All communities on the platform.</p>
      </header>
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {rows.map((c) => (
            <Link key={c.id} href={`/c/${c.slug}`} className="grid items-center gap-3 p-3 hover:bg-muted/30 md:grid-cols-[1fr_140px_100px_140px]">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">/c/{c.slug}</p>
              </div>
              <p className="text-xs text-muted-foreground">{c.category ?? "—"}</p>
              <p className="text-xs">{c.member_count.toLocaleString()} members</p>
              <p className="text-xs text-muted-foreground">
                {new Date(c.created_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
          {rows.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">No communities yet.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
