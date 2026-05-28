import Image from "next/image"
import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { requireRole } from "@/lib/auth/rbac"
import { prisma } from "@/lib/prisma"

import { ModerationActions } from "./ModerationActions"

export const metadata = { title: "Admin · Moderation" }

interface ModItem {
  id: string
  title: string
  preview_url: string | null
  author: string | null
  created_at: string
  href: string | null
}

async function fetchSurfaces() {
  const [artworks, reels, posts, subs] = await Promise.all([
    prisma.artwork.findMany({
      where: { status: "pending" },
      select: {
        id: true,
        title: true,
        slug: true,
        created_at: true,
        artist: { select: { username: true, full_name: true } },
        artwork_media: { select: { url: true, is_primary: true }, take: 2 },
      },
      orderBy: { created_at: "asc" },
    }),
    prisma.reel.findMany({
      where: { status: "pending" },
      select: {
        id: true,
        caption: true,
        thumbnail_url: true,
        created_at: true,
        creator: { select: { username: true, full_name: true } },
      },
      orderBy: { created_at: "asc" },
    }),
    prisma.communityPost.findMany({
      where: { status: "pending" },
      select: {
        id: true,
        title: true,
        body: true,
        media: true,
        created_at: true,
        community_id: true,
        author: { select: { username: true, full_name: true } },
      },
      orderBy: { created_at: "asc" },
    }),
    prisma.competitionSubmission.findMany({
      where: { status: "pending" },
      select: {
        id: true,
        title: true,
        media_url: true,
        created_at: true,
        competition: { select: { slug: true } },
        artist: { select: { username: true, full_name: true } },
      },
      orderBy: { created_at: "asc" },
    }),
  ])

  const mapArtworks: ModItem[] = artworks.map((a) => ({
    id: a.id,
    title: a.title,
    preview_url: a.artwork_media.find((m) => m.is_primary)?.url ?? a.artwork_media[0]?.url ?? null,
    author: a.artist ? (a.artist.full_name ?? `@${a.artist.username}`) : null,
    created_at: a.created_at.toISOString(),
    href: a.artist?.username ? `/artworks/${a.artist.username}/${a.slug}` : null,
  }))

  const mapReels: ModItem[] = reels.map((r) => ({
    id: r.id,
    title: r.caption ?? "Reel",
    preview_url: r.thumbnail_url,
    author: r.creator ? (r.creator.full_name ?? `@${r.creator.username}`) : null,
    created_at: r.created_at.toISOString(),
    href: `/reels#${r.id}`,
  }))

  const mapPosts: ModItem[] = posts.map((p) => ({
    id: p.id,
    title: p.title ?? p.body?.slice(0, 80) ?? "Post",
    preview_url: ((p.media as Array<{ url: string; kind: string }> | null) ?? []).find((m) => m.kind === "image")?.url ?? null,
    author: p.author ? (p.author.full_name ?? `@${p.author.username}`) : null,
    created_at: p.created_at.toISOString(),
    href: null,
  }))

  const mapSubs: ModItem[] = subs.map((s) => ({
    id: s.id,
    title: s.title,
    preview_url: s.media_url,
    author: s.artist ? (s.artist.full_name ?? `@${s.artist.username}`) : null,
    created_at: s.created_at.toISOString(),
    href: s.competition ? `/competitions/${s.competition.slug}` : null,
  }))

  return {
    artworks: mapArtworks,
    reels: mapReels,
    community_posts: mapPosts,
    competition_submissions: mapSubs,
  }
}

export default async function ModerationPage() {
  await requireRole("admin", "super_admin")
  const surfaces = await fetchSurfaces()

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl">Moderation queue</h1>
        <p className="mt-1 text-muted-foreground">
          Approve or reject pending content. Rejected items are returned to drafts with your note.
        </p>
      </header>

      <Tabs defaultValue="artworks">
        <TabsList>
          <TabsTrigger value="artworks">Artworks · {surfaces.artworks.length}</TabsTrigger>
          <TabsTrigger value="reels">Reels · {surfaces.reels.length}</TabsTrigger>
          <TabsTrigger value="community_posts">Posts · {surfaces.community_posts.length}</TabsTrigger>
          <TabsTrigger value="competition_submissions">
            Submissions · {surfaces.competition_submissions.length}
          </TabsTrigger>
        </TabsList>

        {(["artworks", "reels", "community_posts", "competition_submissions"] as const).map((key) => (
          <TabsContent key={key} value={key}>
            <Queue surface={key} items={surfaces[key]} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function Queue({
  surface,
  items,
}: {
  surface: "artworks" | "reels" | "community_posts" | "competition_submissions"
  items: ModItem[]
}) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Nothing pending here.
        </CardContent>
      </Card>
    )
  }
  return <ModerationActions surface={surface} items={items} />
}
