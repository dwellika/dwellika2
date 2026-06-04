import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { requireRole } from "@/lib/auth/rbac"
import { prisma } from "@/lib/prisma"

import { AnnouncementsManager } from "./AnnouncementsManager"
import { ArtistOfWeekManager } from "./ArtistOfWeekManager"
import { CuratedListManager, type FeatureItem } from "./CuratedListManager"
import { TestimonialsManager } from "./TestimonialsManager"

export const metadata = { title: "Admin · Homepage" }
export const dynamic = "force-dynamic"

export default async function AdminHomepagePage() {
  await requireRole("admin", "super_admin")

  const [announcements, testimonials, aowFeature, trendingFeatures, studioFeatures] = await Promise.all([
    prisma.announcement.findMany({ orderBy: { created_at: "desc" }, take: 30 }).catch(() => []),
    prisma.testimonial.findMany({ orderBy: { created_at: "desc" }, take: 50 }).catch(() => []),
    prisma.homepageFeature.findFirst({ where: { section: "artist_of_week", is_active: true } }).catch(() => null),
    prisma.homepageFeature.findMany({ where: { section: "trending_artists", is_active: true }, orderBy: { position: "asc" } }).catch(() => []),
    prisma.homepageFeature.findMany({ where: { section: "best_studio", is_active: true }, orderBy: { position: "asc" } }).catch(() => []),
  ])

  // Resolve usernames/names for all referenced feature entities in one query.
  const ids = [
    ...(aowFeature ? [aowFeature.entity_id] : []),
    ...trendingFeatures.map((f) => f.entity_id),
    ...studioFeatures.map((f) => f.entity_id),
  ]
  const users = ids.length
    ? await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, username: true, full_name: true } }).catch(() => [])
    : []
  const userMap = new Map(users.map((u) => [u.id, u]))

  const toItem = (f: { id: string; entity_id: string }): FeatureItem => {
    const u = userMap.get(f.entity_id)
    return { id: f.id, username: u?.username ?? null, name: u?.full_name ?? null }
  }

  const aowUser = aowFeature ? userMap.get(aowFeature.entity_id) : null
  const aowCurrent = aowFeature
    ? { name: aowUser?.full_name ?? null, username: aowUser?.username ?? null, score: aowFeature.score }
    : null

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Homepage</h1>
        <p className="mt-1 text-muted-foreground">Curate every section of the public homepage.</p>
      </header>

      <Tabs defaultValue="announcements">
        <TabsList className="flex-wrap overflow-x-auto scrollbar-none">
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="testimonials">People</TabsTrigger>
          <TabsTrigger value="aow">Artist of the Week</TabsTrigger>
          <TabsTrigger value="trending">Trending Artists</TabsTrigger>
          <TabsTrigger value="studios">Best Studios</TabsTrigger>
          <TabsTrigger value="sold">Recently Sold</TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="mt-4">
          <Card><CardContent className="pt-6">
            <AnnouncementsManager
              items={announcements.map((a) => ({ id: a.id, category: a.category, title: a.title, is_pinned: a.is_pinned }))}
            />
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="testimonials" className="mt-4">
          <Card><CardContent className="pt-6">
            <TestimonialsManager
              items={testimonials.map((t) => ({ id: t.id, group_name: t.group_name, author_name: t.author_name, is_featured: t.is_featured }))}
            />
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="aow" className="mt-4">
          <Card><CardContent className="pt-6">
            <ArtistOfWeekManager current={aowCurrent} />
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="trending" className="mt-4">
          <Card><CardContent className="pt-6">
            <CuratedListManager
              section="trending_artists"
              label="Trending Artists"
              hint="Promote artists to the homepage Trending rail. Unpinned, it ranks by weekly engagement automatically."
              items={trendingFeatures.map(toItem)}
            />
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="studios" className="mt-4">
          <Card><CardContent className="pt-6">
            <CuratedListManager
              section="best_studio"
              label="Best Studios"
              hint="Promote studios (most active / most members). Unpinned, it ranks automatically."
              items={studioFeatures.map(toItem)}
            />
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="sold" className="mt-4">
          <Card><CardContent className="space-y-2 pt-6 text-sm text-muted-foreground">
            <p>The <strong>Recently Sold</strong> rail is generated automatically from the latest completed orders — no manual curation needed.</p>
            <p>Review and intervene on orders from the <Link href="/admin/orders" className="text-primary underline-offset-4 hover:underline">Orders</Link> page.</p>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
