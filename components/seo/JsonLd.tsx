interface JsonLdProps {
  data: Record<string, unknown>
}

/**
 * Drop into any server component to emit a JSON-LD <script>. Multiple
 * blocks can co-exist on the same page (e.g. Product + BreadcrumbList).
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dwellika.in"

export function artworkJsonLd(input: {
  title: string
  description: string | null
  url: string
  images: string[]
  price: number | null
  currency: string
  forSale: boolean
  inventory?: number
  artistName: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.title,
    description: input.description ?? undefined,
    image: input.images,
    url: `${SITE_URL}${input.url}`,
    brand: { "@type": "Person", name: input.artistName },
    offers: input.forSale && input.price != null
      ? {
          "@type": "Offer",
          priceCurrency: input.currency,
          price: input.price,
          availability:
            (input.inventory ?? 1) > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          url: `${SITE_URL}${input.url}`,
        }
      : undefined,
  }
}

export function productJsonLd(input: {
  title: string
  description: string | null
  url: string
  images: string[]
  price: number
  currency: string
  inventory: number
  ratingAvg: number | null
  ratingCount: number
  sellerName: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.title,
    description: input.description ?? undefined,
    image: input.images,
    url: `${SITE_URL}${input.url}`,
    brand: { "@type": "Organization", name: input.sellerName },
    offers: {
      "@type": "Offer",
      priceCurrency: input.currency,
      price: input.price,
      availability:
        input.inventory > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${SITE_URL}${input.url}`,
    },
    ...(input.ratingAvg && input.ratingCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: input.ratingAvg,
            reviewCount: input.ratingCount,
          },
        }
      : {}),
  }
}

export function personJsonLd(input: {
  name: string
  username: string
  url: string
  image?: string | null
  description?: string | null
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: input.name,
    alternateName: `@${input.username}`,
    url: `${SITE_URL}${input.url}`,
    image: input.image ?? undefined,
    description: input.description ?? undefined,
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; href: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.href}`,
    })),
  }
}

export function eventJsonLd(input: {
  name: string
  description: string | null
  url: string
  startsAt: Date | string
  endsAt: Date | string
  image?: string | null
  hostName?: string
  isVirtual?: boolean
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: input.name,
    description: input.description ?? undefined,
    startDate: input.startsAt,
    endDate: input.endsAt,
    image: input.image ?? undefined,
    url: `${SITE_URL}${input.url}`,
    eventAttendanceMode: input.isVirtual
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    organizer: input.hostName ? { "@type": "Person", name: input.hostName } : undefined,
    location: input.isVirtual
      ? { "@type": "VirtualLocation", url: `${SITE_URL}${input.url}` }
      : undefined,
  }
}

export function courseJsonLd(input: {
  name: string
  description: string | null
  url: string
  image?: string | null
  instructorName: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: input.name,
    description: input.description ?? undefined,
    url: `${SITE_URL}${input.url}`,
    image: input.image ?? undefined,
    provider: { "@type": "Organization", name: "Dwellika", url: SITE_URL },
    instructor: { "@type": "Person", name: input.instructorName },
  }
}

export function videoObjectJsonLd(input: {
  name: string
  description: string | null
  url: string
  thumbnailUrl: string | null
  uploadDate: string
  duration?: string | null
  creatorName: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: input.name,
    description: input.description ?? undefined,
    url: `${SITE_URL}${input.url}`,
    thumbnailUrl: input.thumbnailUrl ?? undefined,
    uploadDate: input.uploadDate,
    duration: input.duration ?? undefined,
    author: { "@type": "Person", name: input.creatorName },
    publisher: { "@type": "Organization", name: "Dwellika", url: SITE_URL },
  }
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Dwellika",
    url: SITE_URL,
    logo: `${SITE_URL}/opengraph-image`,
    sameAs: [],
    description:
      "A living museum for artists and collectors — discover originals, watch artists at work, join craft communities.",
  }
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Dwellika",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/discover?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  }
}
