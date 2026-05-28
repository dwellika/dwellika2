import Link from "next/link"
import dynamic from "next/dynamic"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const LineSeriesChart = dynamic(() =>
  import("@/components/charts/Charts").then((m) => ({ default: m.LineSeriesChart })),
)
const BarSeriesChart = dynamic(() =>
  import("@/components/charts/Charts").then((m) => ({ default: m.BarSeriesChart })),
)
const CategoryPie = dynamic(() =>
  import("@/components/charts/Charts").then((m) => ({ default: m.CategoryPie })),
)

const ACCENT_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--secondary))",
  "hsl(var(--tertiary))",
  "hsl(var(--destructive))",
  "hsl(var(--muted-foreground))",
]
import { requireRole } from "@/lib/auth/rbac"
import { platformAnalytics } from "@/lib/data/analytics"

export const metadata = { title: "Admin · Analytics" }

const RANGES = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
]

interface PageProps {
  searchParams: Promise<{ range?: string }>
}

export default async function AdminAnalyticsPage({ searchParams }: PageProps) {
  await requireRole("admin", "super_admin")
  const { range } = await searchParams
  const days = Math.min(90, Math.max(7, Number(range ?? 30)))
  const data = await platformAnalytics(days)

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-4xl">Analytics</h1>
          <p className="mt-1 text-muted-foreground">Last {days} days · platform-wide.</p>
        </div>
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <Link
              key={r.value}
              href={`/admin/analytics?range=${r.value}`}
              className={
                days === r.value
                  ? "rounded-md border border-primary bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary"
                  : "rounded-md border border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              }
            >
              {r.label}
            </Link>
          ))}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue" value={`₹${data.totals.revenue.toLocaleString()}`} />
        <Stat label="Orders" value={data.totals.orders.toLocaleString()} />
        <Stat label="New users" value={data.totals.signups.toLocaleString()} />
        <Stat
          label="Conversion"
          value={`${data.totals.conversion.toFixed(1)}%`}
          sub="orders / signups"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <LineSeriesChart data={data.revenueSeries} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily orders</CardTitle>
          </CardHeader>
          <CardContent>
            <BarSeriesChart data={data.orderSeries} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>New signups</CardTitle>
          </CardHeader>
          <CardContent>
            <LineSeriesChart data={data.signupSeries} color="hsl(var(--accent))" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top mediums (by published artworks)</CardTitle>
        </CardHeader>
        <CardContent className="grid items-center gap-6 md:grid-cols-2">
          <CategoryPie data={data.topMediums} />
          <ul className="space-y-1 text-sm">
            {data.topMediums.length === 0 ? (
              <li className="text-muted-foreground">No data yet.</li>
            ) : null}
            {data.topMediums.map((m, i) => (
              <li key={m.name} className="flex items-center justify-between border-b border-border py-1">
                <span className="inline-flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{
                      background: ACCENT_COLORS[i % ACCENT_COLORS.length],
                    }}
                  />
                  {m.name}
                </span>
                <span className="tabular-nums">{m.value}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-3xl tabular-nums">{value}</p>
        {sub ? <p className="text-xs text-muted-foreground">{sub}</p> : null}
      </CardContent>
    </Card>
  )
}
