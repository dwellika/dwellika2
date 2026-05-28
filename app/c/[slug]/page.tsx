import { notFound } from "next/navigation"
import Link from "next/link"
import { Settings, Users } from "lucide-react"

import { JoinButton } from "@/components/communities/JoinButton"
import { PostCard } from "@/components/communities/PostCard"
import { PostComposer } from "@/components/communities/PostComposer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SmartImage } from "@/components/ui/smart-image"
import { getCurrentUser } from "@/lib/auth/rbac"
import {
  getCommunityBySlug,
  getMembership,
  listCommunityPosts,
} from "@/lib/data/communities"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const c = await getCommunityBySlug(slug).catch(() => null)
  if (!c) return { title: "Community" }

  const description =
    c.description ?? `Join the ${c.name} community on Dwellika — connect with artists and collectors.`

  return {
    title: c.name,
    description,
    keywords: [c.name, "art community", "artists", "collectors", "Dwellika"],
    alternates: { canonical: `/c/${c.slug}` },
    openGraph: {
      type: "website" as const,
      url: `/c/${c.slug}`,
      title: `${c.name} — Dwellika Community`,
      description,
      images: c.cover_url ? [{ url: c.cover_url, alt: c.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${c.name} — Dwellika Community`,
      description,
      images: c.cover_url ? [c.cover_url] : undefined,
    },
  }
}

export default async function CommunityFeedPage({ params }: PageProps) {
  const { slug } = await params
  const community = await getCommunityBySlug(slug)
  if (!community) notFound()

  const viewer = await getCurrentUser()
  const role = await getMembership(community.id, viewer?.id)
  const isJoined = role !== null
  const isModerator = role === "owner" || role === "moderator"

  const posts = await listCommunityPosts(community.id, { limit: 30 })

  return (
    <div className="relative">
      <div className="relative h-56 w-full overflow-hidden md:h-72">
        <SmartImage
          src={community.cover_url}
          alt={community.name}
          kind="community"
          seed={community.name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="container-page -mt-16 pb-16">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-4xl md:text-5xl">{community.name}</h1>
              {community.category ? <Badge variant="outline">{community.category}</Badge> : null}
              {isModerator ? <Badge>Moderator</Badge> : null}
            </div>
            {community.description ? (
              <p className="mt-2 max-w-2xl text-muted-foreground">{community.description}</p>
            ) : null}
            <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="size-3.5" /> {community.member_count.toLocaleString()} members
            </p>
          </div>
          <div className="flex gap-2">
            {isModerator ? (
              <Button asChild variant="outline">
                <Link href={`/c/${community.slug}/settings`}>
                  <Settings className="size-4" /> Manage
                </Link>
              </Button>
            ) : null}
            <JoinButton
              communityId={community.id}
              initialJoined={isJoined}
              isAuthed={Boolean(viewer)}
            />
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-4">
            {isJoined ? (
              <PostComposer communityId={community.id} />
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                Join the community to start posting.
              </div>
            )}

            {posts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-12 text-center">
                <p className="font-display text-xl">It&apos;s quiet here</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Be the first to post in {community.name}.
                </p>
              </div>
            ) : (
              posts.map((p) => <PostCard key={p.id} post={p} isAuthed={Boolean(viewer)} />)
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-2 font-display text-lg">About</h2>
              <p className="text-sm text-muted-foreground">
                {community.description ??
                  "A craft circle on Dwellika. Share, critique, and learn."}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-2 font-display text-lg">Community rules</h2>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Credit references and inspirations.</li>
                <li>2. Keep critique kind and specific.</li>
                <li>3. No selling, promotions, or AI-generated images without disclosure.</li>
                <li>4. Spoilers behind a fold.</li>
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
