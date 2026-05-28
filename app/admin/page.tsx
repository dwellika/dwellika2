import Link from "next/link"
import {
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Users,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

export const metadata = { title: "Admin overview" }

async function counts() {
  const [
    pendingArtworks,
    pendingReels,
    pendingPosts,
    pendingSubs,
    openDisputes,
    pendingSellers,
    totalUsers,
    totalOrders,
    last24Orders,
  ] = await Promise.all([
    prisma.artwork.count({ where: { status: "pending" } }),
    prisma.reel.count({ where: { status: "pending" } }),
    prisma.communityPost.count({ where: { status: "pending" } }),
    prisma.competitionSubmission.count({ where: { status: "pending" } }),
    prisma.dispute.count({ where: { status: { in: ["open", "reviewing"] } } }),
    prisma.sellerVerificationDoc.count({ where: { status: "pending" } }),
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.count({
      where: { created_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
  ])
  return {
    pendingModeration: pendingArtworks + pendingReels + pendingPosts + pendingSubs,
    openDisputes,
    pendingSellers,
    totalUsers,
    totalOrders,
    last24Orders,
  }
}

export default async function AdminOverview() {
  const c = await counts()

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl">Overview</h1>
        <p className="mt-1 text-muted-foreground">
          Pending queues, active cases, and 24h activity.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Tile href="/admin/moderation" label="Pending moderation" value={c.pendingModeration} Icon={ShieldCheck} />
        <Tile href="/admin/disputes" label="Open disputes" value={c.openDisputes} Icon={ShieldAlert} />
        <Tile href="/admin/sellers" label="Seller verifications" value={c.pendingSellers} Icon={ShoppingBag} />
        <Tile href="/admin/users" label="Total users" value={c.totalUsers} Icon={Users} />
        <Tile href="/admin/orders" label="Total orders" value={c.totalOrders} Icon={ShoppingBag} />
        <Tile href="/admin/orders" label="Orders (24h)" value={c.last24Orders} Icon={ShoppingBag} />
      </div>
    </div>
  )
}

function Tile({ href, label, value, Icon }: { href: string; label: string; value: number; Icon: React.ElementType }) {
  return (
    <Link href={href}>
      <Card className="group transition-all hover:border-primary/40">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="grid size-10 place-items-center rounded-md bg-primary/15 text-primary">
            <Icon className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="font-display text-2xl tabular-nums">{value.toLocaleString()}</p>
          </div>
          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </CardContent>
      </Card>
    </Link>
  )
}
