import { notFound } from "next/navigation"
import Link from "next/link"
import {
  BadgeCheck,
  Calendar,
  Globe,
  Instagram,
  MapPin,
  Sparkles,
  Twitter,
} from "lucide-react"

import { ArtworkCard } from "@/components/artworks/ArtworkCard"
import { BadgeGrid } from "@/components/badges/BadgeGrid"
import { FollowButton } from "@/components/social/FollowButton"
import { ProductCard } from "@/components/products/ProductCard"
import { JsonLd, personJsonLd } from "@/components/seo/JsonLd"
import { TierBadge } from "@/components/badges/TierBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SmartImage } from "@/components/ui/smart-image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUser } from "@/lib/auth/rbac"
import {
  getFollowCounts,
  getProfileByUsername,
  isFollowing,
} from "@/lib/data/artists"
import { listArtworks } from "@/lib/data/artworks"
import { listProducts } from "@/lib/data/products"
import { listReels } from "@/lib/data/reels"
import { listReviews, reviewSummary } from "@/lib/data/reviews"
import { getUserBadges } from "@/lib/data/gamification"
import { prisma } from "@/lib/prisma"
import type { ArtistTier } from "@/lib/types/database"

interface PageProps {
  params: Promise<{ username: string }>
  searchParams: Promise<{ tab?: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params
  const profile = await getProfileByUsername(username).catch(() => null)
  if (!profile) return { title: `@${username}` }

  const displayName = profile.full_name ?? `@${profile.username}`
  const description =
    profile.bio ??
    `${displayName}'s portfolio on Dwellika — original artworks, products, and creative reels.`

  return {
    title: profile.full_name
      ? `${profile.full_name} (@${profile.username})`
      : `@${profile.username}`,
    description,
    keywords: [
      displayName,
      profile.username ?? "",
      "artist portfolio",
      "buy art",
      "original artwork",
      "Dwellika",
      ...(profile.interests ?? []),
    ].filter(Boolean),
    alternates: { canonical: `/u/${profile.username}` },
    openGraph: {
      type: "profile" as const,
      username: profile.username ?? undefined,
      firstName: profile.full_name?.split(" ")[0],
      lastName: profile.full_name?.split(" ").slice(1).join(" ") || undefined,
      title: `${displayName} on Dwellika`,
      description,
      images: profile.avatar_url
        ? [{ url: profile.avatar_url, alt: displayName }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${displayName} on Dwellika`,
      description,
      images: profile.avatar_url ? [profile.avatar_url] : undefined,
    },
  }
}

export default async function ProfilePage({ params, searchParams }: PageProps) {
  const { username } = await params
  const { tab = "portfolio" } = await searchParams

  const profile = await getProfileByUsername(username)
  if (!profile) notFound()

  const viewer = await getCurrentUser()
  const [{ followers, following }, viewerFollowing] = await Promise.all([
    getFollowCounts(profile.id),
    isFollowing(viewer?.id, profile.id),
  ])

  const [{ artworks }, { products }, reels, reviews, reviewStats, badges] = await Promise.all([
    listArtworks({ artistId: profile.id, limit: 24 }),
    listProducts({ sellerId: profile.id, limit: 12 }),
    listReels({ creatorId: profile.id, limit: 12 }),
    listReviews({ kind: "artist", id: profile.id }, 12),
    reviewSummary({ kind: "artist", id: profile.id }),
    getUserBadges(profile.id),
  ])

  const isSelf = viewer?.id === profile.id
  const tier = (profile as { artist_profiles?: { tier?: ArtistTier } | null }).artist_profiles?.tier
  const joinedYear = new Date(profile.created_at).getFullYear()

  const initials =
    profile.full_name
      ?.split(" ")
      .map((p: any) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? profile.username?.slice(0, 2).toUpperCase() ?? "DW"

  return (
    <div className="relative">
      <JsonLd
        data={personJsonLd({
          name: profile.full_name ?? `@${profile.username}`,
          username: profile.username ?? "",
          url: `/u/${profile.username}`,
          image: profile.avatar_url,
          description: profile.bio,
        })}
      />
      <div className="relative h-40 w-full overflow-hidden sm:h-56 md:h-72 lg:h-80">
        <SmartImage
          src={profile.cover_url}
          alt={`${profile.full_name ?? profile.username ?? "Artist"} cover`}
          kind="cover"
          seed={profile.full_name ?? profile.username ?? "cover"}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="container-page relative z-10 -mt-20 pb-16">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-end">
            <Avatar className="h-32 w-32 ring-4 ring-background md:h-40 md:w-40">
              <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.username ?? ""} />
              <AvatarFallback className="text-2xl font-display">{initials}</AvatarFallback>
            </Avatar>

            <div className="text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <h1 className="font-display text-2xl sm:text-3xl md:text-4xl">
                  {profile.full_name ?? `@${profile.username}`}
                </h1>
                {profile.is_verified ? (
                  <Badge variant="default" className="gap-1">
                    <Sparkles className="size-3" /> Verified
                  </Badge>
                ) : null}
                {tier ? <TierBadge tier={tier} /> : null}
              </div>
              <p className="mt-1 text-muted-foreground">@{profile.username}</p>

              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground md:justify-start">
                {profile.location ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" /> {profile.location}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3.5" /> Joined {joinedYear}
                </span>
                <Badge variant="outline" className="capitalize">{profile.role}</Badge>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-wrap gap-2 md:w-auto md:justify-end">
            {isSelf ? (
              <>
                <Button asChild variant="outline">
                  <Link href="/settings/profile">Edit profile</Link>
                </Button>
                {!["artist", "admin", "super_admin"].includes(viewer?.role ?? "") ? (
                  <Button asChild variant="secondary">
                    <Link href="/verify/artist">Verify as artist</Link>
                  </Button>
                ) : null}
                {!["seller", "admin", "super_admin"].includes(viewer?.role ?? "") ? (
                  <Button asChild variant="secondary">
                    <Link href="/verify/seller">Verify as seller</Link>
                  </Button>
                ) : null}
              </>
            ) : (
              <FollowButton
                targetUserId={profile.id}
                initial={viewerFollowing}
                isAuthed={Boolean(viewer)}
              />
            )}
          </div>
        </div>

        <Card className="mt-6 glass md:mt-8">
          <CardContent className="p-4 sm:p-6">
            {profile.bio ? <p className="text-foreground/90">{profile.bio}</p> : null}

            {profile.interests?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.interests.map((i: any) => (
                  <Badge key={i} variant="secondary">
                    {i}
                  </Badge>
                ))}
              </div>
            ) : null}

            {badges.length > 0 ? (
              <div className="mt-6">
                <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
                  Badges
                </p>
                <BadgeGrid badges={badges} />
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm sm:gap-6">
              <Stat label="Followers" value={followers} />
              <Stat label="Following" value={following} />
              <Stat label="Works" value={artworks.length} />
              {reviewStats.count > 0 ? (
                <Stat label="Reviews" value={reviewStats.count} />
              ) : null}
              <Separator orientation="vertical" className="hidden h-6 md:block" />
              {profile.website ? (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <Globe className="size-4" /> {prettyUrl(profile.website)}
                </a>
              ) : null}
              {profile.socials?.twitter ? (
                <a
                  href={`https://twitter.com/${profile.socials.twitter}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <Twitter className="size-4" /> @{profile.socials.twitter}
                </a>
              ) : null}
              {profile.socials?.instagram ? (
                <a
                  href={`https://instagram.com/${profile.socials.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <Instagram className="size-4" /> {profile.socials.instagram}
                </a>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue={tab} className="mt-8 md:mt-10">
          <div className="overflow-x-auto scrollbar-none -mx-0.5 px-0.5">
            <TabsList className="w-max min-w-full">
              <TabsTrigger value="portfolio">Portfolio · {artworks.length}</TabsTrigger>
              <TabsTrigger value="reels">Reels · {reels.length}</TabsTrigger>
              <TabsTrigger value="store">Store · {products.length}</TabsTrigger>
              <TabsTrigger value="reviews">Reviews · {reviewStats.count}</TabsTrigger>
              <TabsTrigger value="exhibitions">Exhibitions</TabsTrigger>
              <TabsTrigger value="workshops">Workshops</TabsTrigger>
              <TabsTrigger value="competitions">Competitions</TabsTrigger>
              <TabsTrigger value="followers">Followers · {followers}</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="portfolio">
            {artworks.length === 0 ? (
              <Empty label="portfolio" />
            ) : (
              <PortfolioMasonry artworks={artworks} isAuthed={Boolean(viewer)} />
            )}
          </TabsContent>

          <TabsContent value="reels">
            {reels.length === 0 ? (
              <Empty label="reels" />
            ) : (
              <ReelsGrid reels={reels} />
            )}
          </TabsContent>

          <TabsContent value="store">
            {products.length === 0 ? (
              <Empty label="products" />
            ) : (
              <StoreGrid products={products} isAuthed={Boolean(viewer)} sellerUsername={profile.username} />
            )}
          </TabsContent>

          <TabsContent value="reviews">
            {reviews.length === 0 ? (
              <Empty label="reviews" />
            ) : (
              <ReviewsList reviews={reviews} />
            )}
          </TabsContent>

          <TabsContent value="exhibitions">
            <Empty label="exhibitions" hint="Exhibitions launch in Phase 3." />
          </TabsContent>
          <TabsContent value="workshops">
            <Empty label="workshops" hint="Workshop hosting launches in Phase 3." />
          </TabsContent>
          <TabsContent value="competitions">
            <Empty label="competitions" hint="Competition entries launch in Phase 3." />
          </TabsContent>

          <TabsContent value="followers">
            <FollowersTab userId={profile.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-display text-xl sm:text-2xl">{value.toLocaleString()}</p>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  )
}

function Empty({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center sm:p-12">
      <p className="font-display text-xl">No {label} yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {hint ?? `This space lights up as soon as ${label} are published.`}
      </p>
    </div>
  )
}

function prettyUrl(url: string) {
  try {
    const u = new URL(url)
    return u.hostname.replace(/^www\./, "") + (u.pathname === "/" ? "" : u.pathname)
  } catch {
    return url
  }
}

function PortfolioMasonry({
  artworks,
  isAuthed,
}: {
  artworks: Awaited<ReturnType<typeof listArtworks>>["artworks"]
  isAuthed: boolean
}) {
  return (
    <div className="mt-6 columns-1 gap-3 [column-fill:_balance] sm:columns-2 md:columns-3 lg:columns-4">
      {artworks.map((a: any) => {
        const artistRef = a.artist ?? null
        return (
          <div key={a.id} className="mb-4 break-inside-avoid">
            <ArtworkCard
              artwork={a}
              artist={{
                id: a.artist_id,
                username: artistRef?.username ?? null,
                full_name: artistRef?.full_name ?? null,
                avatar_url: artistRef?.avatar_url ?? null,
              }}
              isAuthed={isAuthed}
            />
          </div>
        )
      })}
    </div>
  )
}

function StoreGrid({
  products,
  isAuthed,
  sellerUsername,
}: {
  products: Awaited<ReturnType<typeof listProducts>>["products"]
  isAuthed: boolean
  sellerUsername: string | null
}) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
      {products.map((p: any) => (
        <ProductCard
          key={p.id}
          product={p}
          isAuthed={isAuthed}
          seller={{ id: p.seller_id, username: sellerUsername, full_name: null }}
        />
      ))}
    </div>
  )
}

function ReelsGrid({ reels }: { reels: Awaited<ReturnType<typeof listReels>> }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {reels.map((r) => (
        <Link
          key={r.id}
          href={`/reels#${r.id}`}
          className="group relative aspect-[9/16] overflow-hidden rounded-2xl bg-card"
        >
          <SmartImage
            src={r.thumbnail_url}
            alt={r.caption ?? "Reel thumbnail"}
            kind="reel"
            seed={r.caption ?? r.id}
            fill
            sizes="(max-width: 768px) 50vw, 240px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="image-overlay-strong absolute inset-x-0 bottom-0 p-3 text-xs text-white">
            <p className="line-clamp-2">{r.caption ?? "Reel"}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

function ReviewsList({ reviews }: { reviews: Awaited<ReturnType<typeof listReviews>> }) {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {reviews.map((r: any) => (
        <Card key={r.id}>
          <CardContent className="space-y-2 p-5">
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarImage src={r.reviewer?.avatar_url ?? undefined} />
                <AvatarFallback>{(r.reviewer?.full_name ?? "?").slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{r.reviewer?.full_name ?? r.reviewer?.username}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
              <Stars rating={r.rating} className="ml-auto" />
            </div>
            {r.body ? <p className="text-sm">{r.body}</p> : null}
            {r.is_verified_purchase ? (
              <Badge variant="outline" className="gap-1">
                <BadgeCheck className="size-3" /> Verified purchase
              </Badge>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function FollowersTab({ userId }: { userId: string }) {
  const follows = await prisma.follow.findMany({
    where: { following_id: userId },
    select: {
      follower: { select: { id: true, username: true, full_name: true, avatar_url: true } },
    },
    take: 60,
  })

  const followers = follows.map((f: any) => f.follower)

  if (followers.length === 0) {
    return <Empty label="followers" />
  }

  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {followers.map((f: any) => (
        <Link
          key={f.id}
          href={`/u/${f.username}`}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-muted/40"
        >
          <Avatar className="size-10">
            <AvatarImage src={f.avatar_url ?? undefined} />
            <AvatarFallback>{(f.full_name ?? f.username ?? "?").slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{f.full_name ?? f.username}</p>
            <p className="truncate text-xs text-muted-foreground">@{f.username}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={`inline-flex gap-0.5 ${className ?? ""}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`size-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`}
        >
          <path d="M10 1l2.5 6.1L19 8l-5 4.4L15.5 19 10 15.5 4.5 19 6 12.4 1 8l6.5-.9L10 1z" />
        </svg>
      ))}
    </span>
  )
}
