import "server-only"

import { prisma } from "@/lib/prisma"

export interface DailyMetric {
  date: string
  value: number
}

function fmtDay(d: Date) {
  return d.toISOString().slice(0, 10)
}

function rangeDates(days: number) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const out: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    out.push(fmtDay(d))
  }
  return out
}

export async function platformAnalytics(days: number) {
  const since = new Date()
  since.setHours(0, 0, 0, 0)
  since.setDate(since.getDate() - (days - 1))

  const [orders, signups, artworks] = await prisma.$transaction([
    prisma.order.findMany({
      where: { created_at: { gte: since } },
      select: { created_at: true, total: true, status: true, currency: true },
    }),
    prisma.user.findMany({
      where: { created_at: { gte: since } },
      select: { created_at: true, role: true },
    }),
    prisma.artwork.findMany({
      where: { status: "approved" },
      select: { medium: true, like_count: true, view_count: true },
    }),
  ])

  const days_ = rangeDates(days)
  const orderCountByDay = new Map(days_.map((d) => [d, 0]))
  const revenueByDay = new Map(days_.map((d) => [d, 0]))
  const signupsByDay = new Map(days_.map((d) => [d, 0]))

  for (const o of orders) {
    const d = fmtDay(o.created_at)
    if (orderCountByDay.has(d)) {
      orderCountByDay.set(d, (orderCountByDay.get(d) ?? 0) + 1)
      if (["confirmed", "delivered", "shipped", "processing"].includes(o.status)) {
        revenueByDay.set(d, (revenueByDay.get(d) ?? 0) + Number(o.total))
      }
    }
  }
  for (const s of signups) {
    const d = fmtDay(s.created_at)
    if (signupsByDay.has(d)) signupsByDay.set(d, (signupsByDay.get(d) ?? 0) + 1)
  }

  const orderSeries: DailyMetric[] = days_.map((d) => ({ date: d, value: orderCountByDay.get(d) ?? 0 }))
  const revenueSeries: DailyMetric[] = days_.map((d) => ({ date: d, value: revenueByDay.get(d) ?? 0 }))
  const signupSeries: DailyMetric[] = days_.map((d) => ({ date: d, value: signupsByDay.get(d) ?? 0 }))

  const mediumCounts = new Map<string, number>()
  for (const a of artworks) {
    const m = a.medium ?? "Other"
    mediumCounts.set(m, (mediumCounts.get(m) ?? 0) + 1)
  }
  const topMediums = Array.from(mediumCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }))

  const totalRevenue = revenueSeries.reduce((s, r) => s + r.value, 0)
  const totalOrders = orderSeries.reduce((s, r) => s + r.value, 0)
  const totalSignups = signupSeries.reduce((s, r) => s + r.value, 0)
  const conversion = totalSignups > 0 ? Math.min(100, (totalOrders / totalSignups) * 100) : 0

  return { days, revenueSeries, orderSeries, signupSeries, topMediums, totals: { revenue: totalRevenue, orders: totalOrders, signups: totalSignups, conversion } }
}

export async function artistAnalytics(artistId: string, days = 30) {
  const since = new Date()
  since.setHours(0, 0, 0, 0)
  since.setDate(since.getDate() - (days - 1))

  const [followers, salesItems, stats] = await prisma.$transaction([
    prisma.follow.findMany({
      where: { following_id: artistId, created_at: { gte: since } },
      select: { created_at: true },
    }),
    prisma.orderItem.findMany({
      where: { seller_id: artistId },
      select: { subtotal: true, order: { select: { created_at: true, status: true } } },
    }),
    prisma.artwork.findMany({
      where: { artist_id: artistId },
      select: { view_count: true, like_count: true, save_count: true },
    }),
  ])

  const days_ = rangeDates(days)
  const followerByDay = new Map(days_.map((d) => [d, 0]))
  for (const f of followers) {
    const d = fmtDay(f.created_at)
    if (followerByDay.has(d)) followerByDay.set(d, (followerByDay.get(d) ?? 0) + 1)
  }

  const salesByDay = new Map(days_.map((d) => [d, 0]))
  let totalRevenue = 0
  let unitsSold = 0
  for (const item of salesItems) {
    if (!item.order || !["confirmed", "shipped", "delivered"].includes(item.order.status)) continue
    const d = fmtDay(item.order.created_at)
    if (salesByDay.has(d)) salesByDay.set(d, (salesByDay.get(d) ?? 0) + Number(item.subtotal))
    totalRevenue += Number(item.subtotal)
    unitsSold += 1
  }

  const totalViews = stats.reduce((s, a) => s + a.view_count, 0)
  const totalLikes = stats.reduce((s, a) => s + a.like_count, 0)
  const totalSaves = stats.reduce((s, a) => s + a.save_count, 0)
  const totalNewFollowers = Array.from(followerByDay.values()).reduce((s, v) => s + v, 0)

  return {
    followerSeries: days_.map((d) => ({ date: d, value: followerByDay.get(d) ?? 0 })),
    salesSeries: days_.map((d) => ({ date: d, value: salesByDay.get(d) ?? 0 })),
    totals: { revenue: totalRevenue, unitsSold, newFollowers: totalNewFollowers, views: totalViews, likes: totalLikes, saves: totalSaves, conversion: totalViews > 0 ? (unitsSold / totalViews) * 100 : 0 },
  }
}
