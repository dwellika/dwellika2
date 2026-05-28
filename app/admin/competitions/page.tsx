import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { requireRole } from "@/lib/auth/rbac"
import { prisma } from "@/lib/prisma"

export const metadata = { title: "Admin · Competitions" }

export default async function AdminCompetitionsPage() {
  await requireRole("admin", "super_admin")

  const rows = await prisma.competition.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      submission_count: true,
      vote_count: true,
      voting_close_at: true,
      created_at: true,
    },
    orderBy: { created_at: "desc" },
  })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl">Competitions</h1>
        <p className="mt-1 text-muted-foreground">Manage contest lifecycles and announce winners.</p>
      </header>
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {rows.map((c) => (
            <Link
              key={c.id}
              href={`/competitions/${c.slug}`}
              className="grid items-center gap-3 p-3 hover:bg-muted/30 md:grid-cols-[1fr_120px_100px_140px]"
            >
              <p className="font-medium">{c.title}</p>
              <Badge variant="outline" className="w-fit capitalize">{String(c.status).replace("_", " ")}</Badge>
              <p className="text-xs">{c.submission_count} entries</p>
              <p className="text-xs text-muted-foreground">
                {c.voting_close_at ? new Date(c.voting_close_at).toLocaleString() : "—"}
              </p>
            </Link>
          ))}
          {rows.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">No competitions yet.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
