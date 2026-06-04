import "server-only"

import { prisma } from "@/lib/prisma"
import type { MockArtist } from "@/lib/mock/artists"

export interface HomeAnnouncement {
  id: string
  category: "event" | "workshop" | "course" | "notification"
  title: string
  body: string | null
  cta: string | null
  href: string
}

export interface HomeTestimonial {
  id: string
  group: "artist" | "seller" | "buyer"
  author: string
  role: string
  avatar: string | null
  body: string
}

export interface HomeStudio {
  id: string
  username: string
  name: string
  specialty: string
  location: string
  avatar: string | null
  cover: string | null
  members: number
  works: number
  verified: boolean
  promoted: boolean
}

/** Live announcements (pinned first), or [] to fall back to mock fixtures. */
export async function getHomepageAnnouncements(): Promise<HomeAnnouncement[]> {
  const now = new Date()
  const rows = await prisma.announcement
    .findMany({
      where: { OR: [{ ends_at: null }, { ends_at: { gte: now } }] },
      orderBy: [{ is_pinned: "desc" }, { starts_at: "desc" }],
      take: 24,
    })
    .catch(() => [])

  return rows.map((a) => ({
    id: a.id,
    category: a.category as HomeAnnouncement["category"],
    title: a.title,
    body: a.body,
    cta: a.cta_label,
    href: a.cta_url || "#",
  }))
}

/** Featured testimonials; [] falls back to mock. */
export async function getHomepageTestimonials(): Promise<HomeTestimonial[]> {
  const rows = await prisma.testimonial
    .findMany({ where: { is_featured: true }, orderBy: { created_at: "desc" }, take: 60 })
    .catch(() => [])

  return rows.map((t) => ({
    id: t.id,
    group: t.group_name as HomeTestimonial["group"],
    author: t.author_name,
    role: t.role_label ?? "",
    avatar: t.avatar_url,
    body: t.body,
  }))
}

/**
 * Best studios for the homepage: admin-promoted artists lead, then the most
 * followed artists fill the rest.
 */
export async function getBestStudios(limit = 8): Promise<HomeStudio[]> {
  const promotedFeatures = await prisma.homepageFeature
    .findMany({ where: { section: "best_studio", is_active: true }, orderBy: { position: "asc" }, take: limit })
    .catch(() => [])
  const promotedIds = promotedFeatures.map((f) => f.entity_id)

  const studioSelect = {
    id: true, username: true, full_name: true, avatar_url: true, cover_url: true,
    location: true, is_verified: true,
    artist_profile: { select: { specialty: true } },
    _count: { select: { followers: true, artworks: true } },
  } as const

  const [auto, promoted] = await Promise.all([
    prisma.user
      .findMany({
        where: { role: "artist", artist_profile: { isNot: null }, id: { notIn: promotedIds } },
        select: studioSelect,
        orderBy: { followers: { _count: "desc" } },
        take: limit,
      })
      .catch(() => []),
    promotedIds.length
      ? prisma.user.findMany({ where: { id: { in: promotedIds } }, select: studioSelect }).catch(() => [])
      : Promise.resolve([]),
  ])

  const toStudio = (u: (typeof auto)[number], isPromoted: boolean): HomeStudio => ({
    id: u.id,
    username: u.username ?? "anon",
    name: u.full_name ?? u.username ?? "Studio",
    specialty: u.artist_profile?.specialty ?? "Studio",
    location: u.location ?? "",
    avatar: u.avatar_url,
    cover: u.cover_url,
    members: u._count.followers,
    works: u._count.artworks,
    verified: u.is_verified,
    promoted: isPromoted,
  })

  // Preserve admin order for promoted, then append auto-ranked.
  const promotedOrdered = promotedIds
    .map((id) => promoted.find((u) => u.id === id))
    .filter((u): u is NonNullable<typeof u> => Boolean(u && u.username))

  return [
    ...promotedOrdered.map((u) => toStudio(u, true)),
    ...auto.filter((u) => u.username).map((u) => toStudio(u, false)),
  ].slice(0, limit)
}

/**
 * Artists an admin has promoted to the homepage Trending rail
 * (HomepageFeature, section = "trending_artists"), in display order.
 * Returns the MockArtist shape the TrendingArtists component expects.
 */
export async function getPromotedTrendingArtists(): Promise<MockArtist[]> {
  const features = await prisma.homepageFeature.findMany({
    where: { section: "trending_artists", is_active: true },
    orderBy: { position: "asc" },
    take: 12,
  })
  if (features.length === 0) return []

  const users = await prisma.user.findMany({
    where: { id: { in: features.map((f) => f.entity_id) } },
    select: {
      id: true, username: true, full_name: true, avatar_url: true, cover_url: true,
      location: true, is_verified: true,
      artist_profile: { select: { tier: true, specialty: true } },
    },
  })
  const byId = new Map(users.map((u) => [u.id, u]))

  return features
    .map((f) => byId.get(f.entity_id))
    .filter((u): u is NonNullable<typeof u> => Boolean(u && u.username))
    .map((u) => ({
      id: u.id,
      username: u.username ?? "anon",
      name: u.full_name ?? u.username ?? "Artist",
      tier: u.artist_profile?.tier ?? "creator",
      specialty: u.artist_profile?.specialty ?? "Artist",
      location: u.location ?? "",
      avatar: u.avatar_url ?? "/placeholder.svg",
      cover: u.cover_url ?? "/placeholder.svg",
      followers: 0,
      works: 0,
      verified: u.is_verified,
    }))
}
