import Link from "next/link"
import { Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { requireRole } from "@/lib/auth/rbac"
import { prisma } from "@/lib/prisma"

import { WorkshopRowActions } from "./RowActions"

export const metadata = { title: "My workshops · Dwellika" }
export const dynamic = "force-dynamic"

const STATUS_TONE: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-amber-500/20 text-amber-300",
  approved: "bg-emerald-500/20 text-emerald-300",
  rejected: "bg-red-500/20 text-red-300",
  hidden: "bg-muted text-muted-foreground",
}

export default async function ArtistWorkshopsPage() {
  const user = await requireRole("artist", "admin", "super_admin")

  const workshops = await prisma.workshop
    .findMany({
      where: { host_id: user.id },
      orderBy: { starts_at: "desc" },
      include: { _count: { select: { registrations: true } } },
    })
    .catch(() => [])

  return (
    <div className="container-page py-12">
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Studio</p>
          <h1 className="font-display text-4xl">My workshops</h1>
          <p className="mt-1 text-muted-foreground">Host live sessions and recorded masterclasses.</p>
        </div>
        <Button asChild>
          <Link href="/artist/workshops/new"><Plus className="size-4" /> New workshop</Link>
        </Button>
      </header>

      {workshops.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-16 text-center">
          <p className="font-display text-2xl">No workshops yet</p>
          <p className="mt-2 text-muted-foreground">Create your first workshop to start teaching.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workshops.map((w) => (
            <Card key={w.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{w.title}</p>
                    <Badge className={STATUS_TONE[w.status] ?? ""}>{w.status}</Badge>
                    {w.is_live ? <Badge variant="outline">Live</Badge> : <Badge variant="outline">Recorded</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(w.starts_at).toLocaleString()} · {w._count.registrations} registered
                  </p>
                </div>
                <WorkshopRowActions id={w.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
