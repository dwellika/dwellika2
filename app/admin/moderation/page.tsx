import Image from "next/image"
import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { requireRole } from "@/lib/auth/rbac"
import { createAdminClient } from "@/lib/supabase/admin"

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
  const admin = createAdminClient()

  const [artworks, reels, posts, subs] = await Promise.all([
    admin
      .from("artworks")
      .select(
        `id, title, created_at, artist:profiles!artworks_artist_id_fkey(username, full_name), artwork_media(url, is_primary), slug`,
      )
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    admin
      .from("reels")
      .select(
        `id, caption, thumbnail_url, created_at, creator:profiles!reels_creator_id_fkey(username, full_name)`,
      )
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    admin
      .from("community_posts")
      .select(
        `id, title, body, media, created_at, community_id, author:profiles!community_posts_author_id_fkey(username, full_name)`,
      )
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    admin
      .from("competition_submissions")
      .select(
        `id, title, media_url, created_at, competition:competitions!competition_submissions_competition_id_fkey(slug), artist:profiles!competition_submissions_artist_id_fkey(username, full_name)`,
      )
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
  ])

  const mapArtworks: ModItem[] = (
    (artworks.data ?? []) as unknown as Array<{
      id: string
      title: string
      slug: string
      created_at: string
      artist: { username: string | null; full_name: string | null } | null
      artwork_media: { url: string; is_primary: boolean }[]
    }>
  ).map((a) => ({
    id: a.id,
    title: a.title,
    preview_url:
      a.artwork_media.find((m) => m.is_primary)?.url ?? a.artwork_media[0]?.url ?? null,
    author: a.artist ? (a.artist.full_name ?? `@${a.artist.username}`) : null,
    created_at: a.created_at,
    href: a.artist?.username ? `/artworks/${a.artist.username}/${a.slug}` : null,
  }))

  const mapReels: ModItem[] = (
    (reels.data ?? []) as unknown as Array<{
      id: string
      caption: string | null
      thumbnail_url: string | null
      created_at: string
      creator: { username: string | null; full_name: string | null } | null
    }>
  ).map((r) => ({
    id: r.id,
    title: r.caption ?? "Reel",
    preview_url: r.thumbnail_url,
    author: r.creator ? (r.creator.full_name ?? `@${r.creator.username}`) : null,
    created_at: r.created_at,
    href: `/reels#${r.id}`,
  }))

  const mapPosts: ModItem[] = (
    (posts.data ?? []) as unknown as Array<{
      id: string
      title: string | null
      body: string | null
      media: { url: string; kind: string }[] | null
      created_at: string
      community_id: string
      author: { username: string | null; full_name: string | null } | null
    }>
  ).map((p) => ({
    id: p.id,
    title: p.title ?? p.body?.slice(0, 80) ?? "Post",
    preview_url: (p.media ?? []).find((m) => m.kind === "image")?.url ?? null,
    author: p.author ? (p.author.full_name ?? `@${p.author.username}`) : null,
    created_at: p.created_at,
    href: null,
  }))

  const mapSubs: ModItem[] = (
    (subs.data ?? []) as unknown as Array<{
      id: string
      title: string
      media_url: string
      created_at: string
      competition: { slug: string } | null
      artist: { username: string | null; full_name: string | null } | null
    }>
  ).map((s) => ({
    id: s.id,
    title: s.title,
    preview_url: s.media_url,
    author: s.artist ? (s.artist.full_name ?? `@${s.artist.username}`) : null,
    created_at: s.created_at,
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

        {(["artworks", "reels", "community_posts", "competition_submissions"] as const).map(
          (key) => (
            <TabsContent key={key} value={key}>
              <Queue surface={key} items={surfaces[key]} />
            </TabsContent>
          ),
        )}
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
