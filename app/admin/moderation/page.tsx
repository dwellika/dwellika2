import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { requireRole } from "@/lib/auth/rbac"
import { prisma } from "@/lib/prisma"

import { ModerationActions, type ModItem } from "./ModerationActions"
import type { Surface } from "./actions"

export const metadata = { title: "Admin · Moderation" }

async function fetchSurfaces() {
  const [artworks, reels, posts, subs, products] = await Promise.all([
    prisma.artwork.findMany({
      where:   { status: "pending" },
      select:  {
        id: true, title: true, slug: true, created_at: true,
        artist:       { select: { username: true, full_name: true } },
        artwork_media: { select: { url: true, is_primary: true }, take: 2 },
      },
      orderBy: { created_at: "asc" },
    }),
    prisma.reel.findMany({
      where:   { status: "pending" },
      select:  {
        id: true, caption: true, thumbnail_url: true, created_at: true,
        creator: { select: { username: true, full_name: true } },
      },
      orderBy: { created_at: "asc" },
    }),
    prisma.communityPost.findMany({
      where:   { status: "pending" },
      select:  {
        id: true, title: true, body: true, media: true, created_at: true, community_id: true,
        author: { select: { username: true, full_name: true } },
      },
      orderBy: { created_at: "asc" },
    }),
    prisma.competitionSubmission.findMany({
      where:   { status: "pending" },
      select:  {
        id: true, title: true, media_url: true, created_at: true,
        competition: { select: { slug: true } },
        artist:      { select: { username: true, full_name: true } },
      },
      orderBy: { created_at: "asc" },
    }),
    prisma.product.findMany({
      where:   { status: "pending" },
      select:  {
        id: true, title: true, slug: true, price: true, currency: true, created_at: true,
        seller:        { select: { username: true, full_name: true } },
        product_media: { select: { url: true, is_primary: true }, take: 1 },
      },
      orderBy: { created_at: "asc" },
    }),
  ])

  const mapArtworks: ModItem[] = artworks.map((a) => ({
    id:          a.id,
    title:       a.title,
    preview_url: a.artwork_media.find((m) => m.is_primary)?.url ?? a.artwork_media[0]?.url ?? null,
    author:      a.artist ? (a.artist.full_name ?? `@${a.artist.username}`) : null,
    created_at:  a.created_at.toISOString(),
    href:        a.artist?.username ? `/artworks/${a.artist.username}/${a.slug}` : null,
  }))

  const mapReels: ModItem[] = reels.map((r) => ({
    id:          r.id,
    title:       r.caption ?? "Reel",
    preview_url: r.thumbnail_url,
    author:      r.creator ? (r.creator.full_name ?? `@${r.creator.username}`) : null,
    created_at:  r.created_at.toISOString(),
    href:        `/reels#${r.id}`,
  }))

  const mapPosts: ModItem[] = posts.map((p) => ({
    id:          p.id,
    title:       p.title ?? p.body?.slice(0, 80) ?? "Post",
    preview_url: ((p.media as Array<{ url: string; kind: string }> | null) ?? []).find((m) => m.kind === "image")?.url ?? null,
    author:      p.author ? (p.author.full_name ?? `@${p.author.username}`) : null,
    created_at:  p.created_at.toISOString(),
    href:        null,
  }))

  const mapSubs: ModItem[] = subs.map((s) => ({
    id:          s.id,
    title:       s.title,
    preview_url: s.media_url,
    author:      s.artist ? (s.artist.full_name ?? `@${s.artist.username}`) : null,
    created_at:  s.created_at.toISOString(),
    href:        s.competition ? `/competitions/${s.competition.slug}` : null,
  }))

  const mapProducts: ModItem[] = products.map((p) => ({
    id:          p.id,
    title:       p.title,
    preview_url: p.product_media.find((m) => m.is_primary)?.url ?? p.product_media[0]?.url ?? null,
    author:      p.seller ? (p.seller.full_name ?? `@${p.seller.username}`) : null,
    extra:       `${p.currency} ${Number(p.price).toLocaleString()}`,
    created_at:  p.created_at.toISOString(),
    href:        p.seller?.username ? `/products/${p.seller.username}/${p.slug}` : null,
  }))

  return {
    artworks:                mapArtworks,
    reels:                   mapReels,
    community_posts:         mapPosts,
    competition_submissions: mapSubs,
    products:                mapProducts,
  }
}

const TABS: Array<{ key: Surface; label: string }> = [
  { key: "artworks",                label: "Artworks"     },
  { key: "products",                label: "Products"     },
  { key: "reels",                   label: "Reels"        },
  { key: "community_posts",         label: "Posts"        },
  { key: "competition_submissions", label: "Submissions"  },
]

export default async function ModerationPage() {
  await requireRole("admin", "super_admin")
  const surfaces = await fetchSurfaces()

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl">Moderation queue</h1>
        <p className="mt-1 text-muted-foreground">
          Approve, reject, hide, or permanently delete pending content. Notes are
          required for every non-approval action.
        </p>
      </header>

      <Tabs defaultValue="artworks">
        <TabsList className="flex-wrap">
          {TABS.map(({ key, label }) => (
            <TabsTrigger key={key} value={key}>
              {label}
              {surfaces[key].length > 0 && (
                <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                  {surfaces[key].length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map(({ key }) => (
          <TabsContent key={key} value={key}>
            {surfaces[key].length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-sm text-muted-foreground">
                  Nothing pending here.
                </CardContent>
              </Card>
            ) : (
              <ModerationActions surface={key} items={surfaces[key]} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
