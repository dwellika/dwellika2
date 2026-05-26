import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

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
  const admin = createAdminClient()
  const since = new Date()
  since.setHours(0, 0, 0, 0)
  since.setDate(since.getDate() - (days - 1))

  const [ordersRes, signupsRes, artworkRes] = await Promise.all([
    admin
      .from("orders")
      .select("created_at, total, status, currency")
      .gte("created_at", since.toISOString()),
    admin
      .from("profiles")
      .select("created_at, role")
      .gte("created_at", since.toISOString()),
    admin
      .from("artworks")
      .select("medium, like_count, view_count")
      .eq("status", "approved"),
  ])

  const days_ = rangeDates(days)
  const orders = (ordersRes.data ?? []) as Array<{
    created_at: string
    total: number
    status: string
    currency: string
  }>
  const signups = (signupsRes.data ?? []) as Array<{ created_at: string; role: string }>
  const artworks = (artworkRes.data ?? []) as Array<{
    medium: string | null
    like_count: number
    view_count: number
  }>

  const orderCountByDay = new Map(days_.map((d) => [d, 0]))
  const revenueByDay = new Map(days_.map((d) => [d, 0]))
  const signupsByDay = new Map(days_.map((d) => [d, 0]))

  for (const o of orders) {
    const d = fmtDay(new Date(o.created_at))
    if (orderCountByDay.has(d)) {
      orderCountByDay.set(d, (orderCountByDay.get(d) ?? 0) + 1)
      if (o.status === "confirmed" || o.status === "delivered" || o.status === "shipped" || o.status === "processing") {
        revenueByDay.set(d, (revenueByDay.get(d) ?? 0) + Number(o.total))
      }
    }
  }

  for (const s of signups) {
    const d = fmtDay(new Date(s.created_at))
    if (signupsByDay.has(d)) {
      signupsByDay.set(d, (signupsByDay.get(d) ?? 0) + 1)
    }
  }

  const orderSeries: DailyMetric[] = days_.map((d) => ({ date: d, value: orderCountByDay.get(d) ?? 0 }))
  const revenueSeries: DailyMetric[] = days_.map((d) => ({ date: d, value: revenueByDay.get(d) ?? 0 }))
  const signupSeries: DailyMetric[] = days_.map((d) => ({ date: d, value: signupsByDay.get(d) ?? 0 }))

  // Top mediums
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
  const conversion =
    totalSignups > 0 ? Math.min(100, (totalOrders / totalSignups) * 100) : 0

  return {
    days,
    revenueSeries,
    orderSeries,
    signupSeries,
    topMediums,
    totals: {
      revenue: totalRevenue,
      orders: totalOrders,
      signups: totalSignups,
      conversion,
    },
  }
}

export async function artistAnalytics(artistId: string, days = 30) {
  const supabase = await createClient()
  const since = new Date()
  since.setHours(0, 0, 0, 0)
  since.setDate(since.getDate() - (days - 1))

  const [followersRes, salesRes, viewsRes] = await Promise.all([
    supabase
      .from("follows")
      .select("created_at")
      .eq("following_id", artistId)
      .gte("created_at", since.toISOString()),
    supabase
      .from("order_items")
      .select("subtotal, order:orders!order_items_order_id_fkey(created_at, status)")
      .eq("seller_id", artistId),
    supabase
      .from("artworks")
      .select("view_count, like_count, save_count")
      .eq("artist_id", artistId),
  ])

  const days_ = rangeDates(days)
  const followers = (followersRes.data ?? []) as Array<{ created_at: string }>
  const salesRaw =
    (salesRes.data ?? []) as unknown as Array<{
      subtotal: number
      order: { created_at: string; status: string } | null
    }>
  const stats = (viewsRes.data ?? []) as Array<{
    view_count: number
    like_count: number
    save_count: number
  }>

  const followerByDay = new Map(days_.map((d) => [d, 0]))
  for (const f of followers) {
    const d = fmtDay(new Date(f.created_at))
    if (followerByDay.has(d)) {
      followerByDay.set(d, (followerByDay.get(d) ?? 0) + 1)
    }
  }
  const followerSeries: DailyMetric[] = days_.map((d) => ({
    date: d,
    value: followerByDay.get(d) ?? 0,
  }))

  const salesByDay = new Map(days_.map((d) => [d, 0]))
  let totalRevenue = 0
  let unitsSold = 0
  for (const s of salesRaw) {
    if (!s.order) continue
    if (!["confirmed", "shipped", "delivered"].includes(s.order.status)) continue
    const d = fmtDay(new Date(s.order.created_at))
    if (salesByDay.has(d)) {
      salesByDay.set(d, (salesByDay.get(d) ?? 0) + Number(s.subtotal))
    }
    totalRevenue += Number(s.subtotal)
    unitsSold += 1
  }
  const salesSeries: DailyMetric[] = days_.map((d) => ({
    date: d,
    value: salesByDay.get(d) ?? 0,
  }))

  const totalViews = stats.reduce((s, a) => s + (a.view_count ?? 0), 0)
  const totalLikes = stats.reduce((s, a) => s + (a.like_count ?? 0), 0)
  const totalSaves = stats.reduce((s, a) => s + (a.save_count ?? 0), 0)
  const conversion = totalViews > 0 ? (unitsSold / totalViews) * 100 : 0
  const totalNewFollowers = followerSeries.reduce((s, x) => s + x.value, 0)

  return {
    followerSeries,
    salesSeries,
    totals: {
      revenue: totalRevenue,
      unitsSold,
      newFollowers: totalNewFollowers,
      views: totalViews,
      likes: totalLikes,
      saves: totalSaves,
      conversion,
    },
  }
}
