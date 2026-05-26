import { notFound } from "next/navigation"
import Link from "next/link"
import { BadgeCheck, Ruler, Sparkles } from "lucide-react"

import { ArtworkCard } from "@/components/artworks/ArtworkCard"
import { CommentThread } from "@/components/comments/CommentThread"
import {
  artworkJsonLd,
  breadcrumbJsonLd,
  JsonLd,
} from "@/components/seo/JsonLd"
import { FollowButton } from "@/components/social/FollowButton"
import { LikeButton, SaveButton } from "@/components/social/LikeSaveButtons"
import { LeaveReviewForm } from "@/components/reviews/LeaveReviewForm"
import { ReviewList } from "@/components/reviews/ReviewList"
import { AddToCartButton } from "@/components/shop/AddToCartButton"
import { MediaGallery } from "@/components/shop/MediaGallery"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getCurrentUser } from "@/lib/auth/rbac"
import {
  getArtworkBySlug,
  listSimilarArtworks,
} from "@/lib/data/artworks"
import { isFollowing } from "@/lib/data/artists"
import { isLiked, isSaved } from "@/lib/data/social-actions"
import { listReviews, reviewSummary } from "@/lib/data/reviews"

interface PageProps {
  params: Promise<{ username: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { username, slug } = await params
  const data = await getArtworkBySlug(username, slug)
  if (!data) return { title: "Artwork" }
  return {
    title: `${data.title} · ${data.artist.full_name ?? `@${data.artist.username}`}`,
    description: data.description ?? undefined,
    openGraph: {
      images:
        data.artwork_media?.filter((m) => m.kind === "image").map((m) => m.url) ?? [],
    },
  }
}

export default async function ArtworkDetailPage({ params }: PageProps) {
  const { username, slug } = await params
  const data = await getArtworkBySlug(username, slug)
  if (!data) notFound()

  const viewer = await getCurrentUser()
  const [liked, saved, viewerFollowing, similar, reviews, reviewStats] =
    await Promise.all([
      isLiked("artwork", data.id),
      isSaved("artwork", data.id),
      isFollowing(viewer?.id, data.artist_id),
      listSimilarArtworks(data.id, { medium: data.medium ?? null }, 6),
      listReviews({ kind: "artwork", id: data.id }, 8),
      reviewSummary({ kind: "artwork", id: data.id }),
    ])

  const initials =
    data.artist.full_name
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? data.artist.username?.slice(0, 2).toUpperCase() ?? "DW"

  const media = data.artwork_media
    .sort((a, b) => a.position - b.position)
    .map((m) => ({ url: m.url, kind: m.kind, thumbnail_url: m.thumbnail_url, width: m.width, height: m.height }))

  const isSelf = viewer?.id === data.artist_id

  const dimensions = data.dimensions as
    | { width?: number; height?: number; depth?: number; unit?: string }
    | null

  const pageUrl = `/artworks/${data.artist.username}/${data.slug}`
  const imageUrls = media.filter((m) => m.kind === "image").map((m) => m.url)

  return (
    <div className="container-page py-10">
      <JsonLd
        data={artworkJsonLd({
          title: data.title,
          description: data.description,
          url: pageUrl,
          images: imageUrls,
          price: data.price,
          currency: data.currency,
          forSale: data.for_sale,
          artistName: data.artist.full_name ?? `@${data.artist.username}`,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Artworks", href: "/shopping/arts" },
          { name: data.artist.full_name ?? `@${data.artist.username}`, href: `/u/${data.artist.username}` },
          { name: data.title, href: pageUrl },
        ])}
      />
      <nav className="mb-6 text-xs text-muted-foreground">
        <Link href="/shopping/arts" className="hover:text-foreground">
          Artworks
        </Link>
        <span> · </span>
        <Link href={`/u/${data.artist.username}`} className="hover:text-foreground">
          @{data.artist.username}
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <MediaGallery media={media} alt={data.title} />

        <div className="space-y-6">
          <header className="space-y-2">
            <div className="flex items-center gap-2">
              {data.medium ? <Badge variant="secondary">{data.medium}</Badge> : null}
              {data.tags?.slice(0, 4).map((t) => (
                <Badge key={t} variant="outline">{t}</Badge>
              ))}
              {data.prints_available ? (
                <Badge variant="default" className="gap-1">
                  <Sparkles className="size-3" /> Prints available
                </Badge>
              ) : null}
            </div>
            <h1 className="font-display text-4xl md:text-5xl">{data.title}</h1>
            <Link
              href={`/u/${data.artist.username}`}
              className="inline-flex items-center gap-3 text-muted-foreground hover:text-foreground"
            >
              <Avatar className="size-8">
                <AvatarImage src={data.artist.avatar_url ?? undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span>
                by <span className="text-foreground">{data.artist.full_name ?? `@${data.artist.username}`}</span>
              </span>
              {data.artist.is_verified ? <BadgeCheck className="size-4 text-primary" /> : null}
            </Link>
          </header>

          <Card>
            <CardContent className="space-y-4 p-5">
              {data.for_sale && data.price != null ? (
                <>
                  <p className="font-display text-3xl">
                    {formatPrice(data.price, data.currency)}
                  </p>
                  <AddToCartButton
                    item={{
                      kind: "artwork",
                      id: data.id,
                      slug: data.slug,
                      title: data.title,
                      image: media[0]?.url ?? null,
                      unitPrice: data.price,
                      currency: data.currency,
                      sellerId: data.artist_id,
                      artistUsername: data.artist.username,
                    }}
                    className="w-full"
                    goToCart={false}
                  />
                </>
              ) : (
                <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  This work is not currently for sale. You can still follow the
                  artist to be the first to know when new pieces are listed.
                </div>
              )}

              <div className="flex items-center gap-2">
                <LikeButton
                  targetKind="artwork"
                  targetId={data.id}
                  initial={liked}
                  count={data.like_count}
                  isAuthed={Boolean(viewer)}
                  variant="default"
                />
                <SaveButton
                  targetKind="artwork"
                  targetId={data.id}
                  initial={saved}
                  isAuthed={Boolean(viewer)}
                />
                {isSelf ? null : (
                  <FollowButton
                    targetUserId={data.artist_id}
                    initial={viewerFollowing}
                    isAuthed={Boolean(viewer)}
                    size="sm"
                    className="ml-auto"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {data.description ? (
            <section>
              <h2 className="mb-2 font-display text-xl">About this work</h2>
              <p className="whitespace-pre-line text-foreground/90">{data.description}</p>
            </section>
          ) : null}

          <Separator />

          <section className="grid gap-3 text-sm md:grid-cols-2">
            <Spec label="Medium" value={data.medium} />
            <Spec label="Style" value={data.style} />
            <Spec label="Subject" value={data.subject} />
            {dimensions?.width && dimensions?.height ? (
              <Spec
                label="Dimensions"
                value={`${dimensions.width} × ${dimensions.height}${dimensions.depth ? ` × ${dimensions.depth}` : ""} ${dimensions.unit ?? "cm"}`}
                Icon={Ruler}
              />
            ) : null}
            {data.edition_size ? (
              <Spec label="Edition size" value={String(data.edition_size)} />
            ) : null}
            <Spec
              label="Custom size"
              value={data.custom_size_option ? "Available on request" : "Not available"}
            />
          </section>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <h2 className="mb-6 font-display text-2xl">Reviews</h2>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <ReviewList reviews={reviews} summary={reviewStats} />
          <LeaveReviewForm
            targetKind="artwork"
            targetId={data.id}
            isAuthed={Boolean(viewer)}
          />
        </div>
      </section>

      {/* Comments */}
      <section className="mt-16">
        <CommentThread
          targetKind="artwork"
          targetId={data.id}
          isAuthed={Boolean(viewer)}
          currentUserId={viewer?.id}
        />
      </section>

      {/* Similar */}
      {similar.length > 0 ? (
        <section className="mt-20">
          <h2 className="mb-6 font-display text-2xl">Similar works</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {similar.map((s) => (
              <ArtworkCard
                key={s.id}
                artwork={s}
                artist={{
                  id: s.artist_id,
                  username: data.artist.username,
                  full_name: null,
                  avatar_url: null,
                }}
                isAuthed={Boolean(viewer)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function Spec({
  label,
  value,
  Icon,
}: {
  label: string
  value: string | null | undefined
  Icon?: React.ElementType
}) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-0.5 inline-flex items-center gap-1.5">
        {Icon ? <Icon className="size-3.5 text-muted-foreground" /> : null} {value}
      </p>
    </div>
  )
}

function formatPrice(price: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(price)
  } catch {
    return `${currency} ${price.toLocaleString()}`
  }
}
