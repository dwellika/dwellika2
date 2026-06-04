import Link from "next/link"
import { Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { requireRole } from "@/lib/auth/rbac"
import { prisma } from "@/lib/prisma"

import { EventRowActions } from "./RowActions"

export const metadata = { title: "Admin · Events" }
export const dynamic = "force-dynamic"

export default async function AdminEventsPage() {
  await requireRole("admin", "super_admin")

  const events = await prisma.event.findMany({ orderBy: { created_at: "desc" } }).catch(() => [])

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl">Events</h1>
          <p className="mt-1 text-muted-foreground">
            Competitions, workshops, exhibitions and other events shown across the platform.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new"><Plus className="size-4" /> New event</Link>
        </Button>
      </header>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-12 text-center">
          <p className="font-display text-xl">No events yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <Card key={e.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{e.title}</p>
                    <Badge variant="outline" className="capitalize">{e.kind}</Badge>
                    <Badge className={e.is_published ? "bg-emerald-500/20 text-emerald-300" : "bg-muted text-muted-foreground"}>
                      {e.is_published ? "Published" : "Draft"}
                    </Badge>
                    {e.is_featured ? <Badge variant="secondary">Featured</Badge> : null}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {e.starts_at ? new Date(e.starts_at).toLocaleString() : "No date"}
                    {e.location ? ` · ${e.location}` : ""}
                  </p>
                </div>
                <EventRowActions id={e.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
