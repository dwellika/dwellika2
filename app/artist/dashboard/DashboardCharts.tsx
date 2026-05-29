"use client"

import dynamic from "next/dynamic"
import type { DailyMetric } from "@/lib/data/analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const BarSeriesChart = dynamic(
  () => import("@/components/charts/Charts").then((m) => ({ default: m.BarSeriesChart })),
  { ssr: false },
)
const Sparkline = dynamic(
  () => import("@/components/charts/Charts").then((m) => ({ default: m.Sparkline })),
  { ssr: false },
)

export function DashboardCharts({
  followerSeries,
  salesSeries,
}: {
  followerSeries: DailyMetric[]
  salesSeries: DailyMetric[]
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Followers gained per day</CardTitle>
        </CardHeader>
        <CardContent>
          <Sparkline data={followerSeries} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Daily sales</CardTitle>
        </CardHeader>
        <CardContent>
          <BarSeriesChart data={salesSeries} height={120} />
        </CardContent>
      </Card>
    </div>
  )
}
