import { notFound } from "next/navigation"
import Link from "next/link"
import { Star, Truck } from "lucide-react"

import { LikeButton, SaveButton } from "@/components/social/LikeSaveButtons"
import { LeaveReviewForm } from "@/components/reviews/LeaveReviewForm"
import { ReviewList } from "@/components/reviews/ReviewList"
import {
  breadcrumbJsonLd,
  JsonLd,
  productJsonLd,
} from "@/components/seo/JsonLd"
import { AddToCartButton } from "@/components/shop/AddToCartButton"
import { MediaGallery } from "@/components/shop/MediaGallery"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getCurrentUser } from "@/lib/auth/rbac"
import { getProductBySlug } from "@/lib/data/products"
import { isLiked, isSaved } from "@/lib/data/social-actions"
import { listReviews, reviewSummary } from "@/lib/data/reviews"

interface PageProps {
  params: Promise<{ username: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { username, slug } = await params
  const data = await getProductBySlug(username, slug).catch(() => null)
  if (!data) return { title: "Product" }

  const sellerName = data.seller.full_name ?? `@${data.seller.username}`
  const pageUrl = `/products/${data.seller.username}/${data.slug}`
  const imageUrls = data.product_media
    .sort((a, b) => a.position - b.position)
    .filter((m) => m.kind === "image")
    .map((m) => m.url)
  const description = data.description ?? `${data.title} by ${sellerName} — shop on Dwellika.`

  return {
    title: `${data.title} · ${sellerName}`,
    description,
    keywords: [data.title, sellerName, "buy", "shop", "Dwellika"].filter(Boolean) as string[],
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "website" as const,
      url: pageUrl,
      title: `${data.title} by ${sellerName}`,
      description,
      images: imageUrls.length > 0
        ? imageUrls.map((url) => ({ url, alt: data.title }))
        : undefined,
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${data.title} by ${sellerName}`,
      description,
      images: imageUrls.slice(0, 1),
    },
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { username, slug } = await params
  const data = await getProductBySlug(username, slug)
  if (!data) notFound()

  const viewer = await getCurrentUser()
  const [liked, saved, reviews, reviewStats] = await Promise.all([
    isLiked("product", data.id),
    isSaved("product", data.id),
    listReviews({ kind: "product", id: data.id }, 8),
    reviewSummary({ kind: "product", id: data.id }),
  ])

  const initials =
    data.seller.full_name
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? data.seller.username?.slice(0, 2).toUpperCase() ?? "DW"

  const media = data.product_media
    .sort((a, b) => a.position - b.position)
    .map((m) => ({ url: m.url, kind: m.kind, thumbnail_url: m.thumbnail_url }))

  const pageUrl = `/products/${data.seller.username}/${data.slug}`
  const imageUrls = media.filter((m) => m.kind === "image").map((m) => m.url)

  return (
    <div className="container-page py-10">
      <JsonLd
        data={productJsonLd({
          title: data.title,
          description: data.description,
          url: pageUrl,
          images: imageUrls,
          price: data.price,
          currency: data.currency,
          inventory: data.inventory,
          ratingAvg: data.rating_avg,
          ratingCount: data.rating_count,
          sellerName: data.seller.full_name ?? `@${data.seller.username}`,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: data.category.replace("_", " "), href: `/shopping/${categoryHref(data.category)}` },
          { name: data.seller.full_name ?? `@${data.seller.username}`, href: `/u/${data.seller.username}` },
          { name: data.title, href: pageUrl },
        ])}
      />
      <nav className="mb-6 text-xs text-muted-foreground">
        <Link
          href={`/shopping/${categoryHref(data.category)}`}
          className="capitalize hover:text-foreground"
        >
          {data.category.replace("_", " ")}
        </Link>
        <span> · </span>
        <Link href={`/u/${data.seller.username}`} className="hover:text-foreground">
          @{data.seller.username}
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <MediaGallery media={media} alt={data.title} />

        <div className="space-y-6">
          <header className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {data.category.replace("_", " ")}
              </Badge>
              {data.tags?.slice(0, 4).map((t) => (
                <Badge key={t} variant="outline">{t}</Badge>
              ))}
            </div>
            <h1 className="font-display text-4xl md:text-5xl">{data.title}</h1>
            <Link
              href={`/u/${data.seller.username}`}
              className="inline-flex items-center gap-3 text-muted-foreground hover:text-foreground"
            >
              <Avatar className="size-8">
                <AvatarImage src={(data.seller as { avatar_url?: string | null }).avatar_url ?? undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span>by <span className="text-foreground">{data.seller.full_name ?? `@${data.seller.username}`}</span></span>
            </Link>
            {data.rating_avg ? (
              <p className="inline-flex items-center gap-1 text-sm">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                {data.rating_avg.toFixed(1)}{" "}
                <span className="text-muted-foreground">({data.rating_count} reviews)</span>
              </p>
            ) : null}
          </header>

          <Card>
            <CardContent className="space-y-4 p-5">
              <p className="font-display text-3xl">
                {formatPrice(data.price, data.currency)}
              </p>
              <p className="text-sm text-muted-foreground">
                {data.inventory > 0 ? `${data.inventory} in stock` : "Sold out"}
              </p>
              <AddToCartButton
                item={{
                  kind: "product",
                  id: data.id,
                  slug: data.slug,
                  title: data.title,
                  image: media[0]?.url ?? null,
                  unitPrice: data.price,
                  currency: data.currency,
                  sellerId: data.seller_id,
                }}
                disabled={data.inventory === 0}
                className="w-full"
              />
              <div className="flex items-center gap-2">
                <LikeButton
                  targetKind="product"
                  targetId={data.id}
                  initial={liked}
                  isAuthed={Boolean(viewer)}
                  variant="default"
                />
                <SaveButton
                  targetKind="product"
                  targetId={data.id}
                  initial={saved}
                  isAuthed={Boolean(viewer)}
                />
              </div>

              <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                <Truck className="mr-1 inline size-3" /> Free shipping over ₹2,000 · Returns within 7 days
              </div>
            </CardContent>
          </Card>

          {data.description ? (
            <section>
              <h2 className="mb-2 font-display text-xl">About this product</h2>
              <p className="whitespace-pre-line text-foreground/90">{data.description}</p>
            </section>
          ) : null}

          <Separator />
        </div>
      </div>

      <section className="mt-16">
        <h2 className="mb-6 font-display text-2xl">Reviews</h2>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <ReviewList reviews={reviews} summary={reviewStats} />
          <LeaveReviewForm
            targetKind="product"
            targetId={data.id}
            isAuthed={Boolean(viewer)}
          />
        </div>
      </section>
    </div>
  )
}

function categoryHref(c: string) {
  switch (c) {
    case "home_decor":
      return "decor-items"
    case "art_supplies":
      return "art-supplies"
    case "wearing_arts":
      return "wearing-arts"
    default:
      return c
  }
}

function formatPrice(price: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(price)
  } catch {
    return `${currency} ${price.toLocaleString()}`
  }
}
