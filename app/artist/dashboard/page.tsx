import Link from "next/link"
import { Eye, Film, GraduationCap, Heart, Mic, Plus, Sparkles, TrendingUp, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SmartImage } from "@/components/ui/smart-image"
import { DashboardCharts } from "./DashboardCharts"
import { requireRole } from "@/lib/auth/rbac"
import { artistAnalytics } from "@/lib/data/analytics"
import { listArtworks } from "@/lib/data/artworks"

export const metadata = { title: "Artist dashboard" }

const STATUS_TONE: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-amber-500/20 text-amber-300",
  approved: "bg-emerald-500/20 text-emerald-300",
  rejected: "bg-red-500/20 text-red-300",
  hidden: "bg-muted text-muted-foreground",
}

export default async function ArtistDashboardPage() {
  const user = await requireRole("artist", "admin", "super_admin")
  const [{ artworks }, analytics] = await Promise.all([
    listArtworks({ artistId: user.id, status: "all", limit: 60 }),
    artistAnalytics(user.id, 30),
  ])

  return (
    <div className="container-page py-12">
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Studio</p>
          <h1 className="font-display text-4xl">My artworks</h1>
          <p className="mt-1 text-muted-foreground">
            Upload, edit, and track approvals for your work.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="ghost">
            <Link href="/artist/workshops"><Mic className="size-4" /> Workshops</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/artist/courses"><GraduationCap className="size-4" /> Courses</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/artist/featured"><Sparkles className="size-4" /> Featured</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/artist/reels/new">
              <Film className="size-4" /> New reel
            </Link>
          </Button>
          <Button asChild>
            <Link href="/artist/artworks/new">
              <Plus className="size-4" /> New artwork
            </Link>
          </Button>
        </div>
      </header>

      {/* Analytics */}
      <section className="mb-10 space-y-4">
        <h2 className="font-display text-2xl">Last 30 days</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPI
            Icon={Eye}
            label="Views"
            value={analytics.totals.views.toLocaleString()}
          />
          <KPI
            Icon={Heart}
            label="Likes"
            value={analytics.totals.likes.toLocaleString()}
          />
          <KPI
            Icon={Users}
            label="New followers"
            value={analytics.totals.newFollowers.toLocaleString()}
          />
          <KPI
            Icon={TrendingUp}
            label="Conversion"
            value={`${analytics.totals.conversion.toFixed(2)}%`}
            sub="sales / views"
          />
        </div>
        <DashboardCharts
          followerSeries={analytics.followerSeries}
          salesSeries={analytics.salesSeries}
        />
      </section>

      <h2 className="mb-4 font-display text-2xl">My artworks</h2>
      {artworks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="font-display text-xl">Your studio is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload your first artwork to start your portfolio.
            </p>
            <Button asChild className="mt-6">
              <Link href="/artist/artworks/new">Upload artwork</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {artworks.map((a) => {
            const cover =
              a.artwork_media?.find((m) => m.is_primary)?.url ??
              a.artwork_media?.[0]?.url ??
              null
            return (
              <Card key={a.id} className="overflow-hidden">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <SmartImage
                    src={cover}
                    alt={a.title}
                    kind="artwork"
                    seed={a.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <Badge className={`absolute left-3 top-3 capitalize ${STATUS_TONE[a.status] ?? ""}`}>
                    {a.status}
                  </Badge>
                </div>
                <CardContent className="space-y-2 p-4">
                  <p className="line-clamp-1 font-display text-base">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.medium ?? "—"} ·{" "}
                    {a.for_sale && a.price != null
                      ? `₹${Number(a.price).toLocaleString()}`
                      : "Not for sale"}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Views {a.view_count}</span>
                    <span>Likes {a.like_count}</span>
                    <span>Saves {a.save_count}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function KPI({
  Icon,
  label,
  value,
  sub,
}: {
  Icon: React.ElementType
  label: string
  value: string
  sub?: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <div className="grid size-10 place-items-center rounded-md bg-primary/15 text-primary">
          <Icon className="size-5" />
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="font-display text-2xl tabular-nums">{value}</p>
          {sub ? <p className="text-xs text-muted-foreground">{sub}</p> : null}
        </div>
      </CardContent>
    </Card>
  )
}
