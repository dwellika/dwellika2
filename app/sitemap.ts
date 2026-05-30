import type { MetadataRoute } from "next"

import { prisma } from "@/lib/prisma"

// Force runtime generation so Prisma queries run on request, not during
// `next build` when the Railway database is unreachable.
export const dynamic = "force-dynamic"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

const STATIC_PATHS: Array<[string, number]> = [
  ["", 1.0],
  ["/artists", 0.9],
  ["/shopping/arts", 0.9],
  ["/shopping/decor-items", 0.8],
  ["/shopping/art-supplies", 0.8],
  ["/reels", 0.8],
  ["/communities", 0.8],
  ["/competitions", 0.8],
  ["/workshops", 0.7],
  ["/courses", 0.7],
  ["/discover", 0.7],
  ["/terms", 0.3],
  ["/privacy", 0.3],
  ["/cookies", 0.2],
  ["/accessibility", 0.2],
]

function entry(
  path: string,
  priority: number,
  lastModified?: Date,
  freq: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly",
): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path}`,
    lastModified: lastModified ?? new Date(),
    changeFrequency: freq,
    priority,
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = STATIC_PATHS.map(([path, priority]) =>
    entry(path, priority, undefined, path === "" ? "daily" : "weekly"),
  )

  const [artworks, artists, products, competitions, communities, courses, workshops] =
    await Promise.all([
      prisma.artwork
        .findMany({
          where: { status: "approved" },
          select: { slug: true, updated_at: true, artist: { select: { username: true } } },
          orderBy: { updated_at: "desc" },
          take: 1000,
        })
        .catch(() => []),

      prisma.user
        .findMany({
          where: { role: { in: ["artist", "seller"] } },
          select: { username: true, updated_at: true },
          take: 2000,
        })
        .catch(() => []),

      prisma.product
        .findMany({
          where: { status: "approved" },
          select: { slug: true, updated_at: true, seller: { select: { username: true } } },
          orderBy: { updated_at: "desc" },
          take: 1000,
        })
        .catch(() => []),

      prisma.competition
        .findMany({
          where: { status: { not: "draft" } },
          select: { slug: true, updated_at: true },
          take: 500,
        })
        .catch(() => []),

      prisma.community
        .findMany({
          where: { is_private: false },
          select: { slug: true, updated_at: true },
          take: 500,
        })
        .catch(() => []),

      prisma.course
        .findMany({
          where: { status: "approved" },
          select: { slug: true, updated_at: true },
          take: 500,
        })
        .catch(() => []),

      prisma.workshop
        .findMany({
          where: { status: "approved" },
          select: { slug: true, updated_at: true },
          take: 500,
        })
        .catch(() => []),
    ])

  const artworkEntries = artworks
    .filter((a: any) => a.artist?.username)
    .map((a: any) => entry(`/artworks/${a.artist!.username}/${a.slug}`, 0.8, a.updated_at))

  const artistEntries = artists
    .filter((u: any) => u.username)
    .map((u: any) => entry(`/u/${u.username}`, 0.8, u.updated_at))

  const productEntries = products
    .filter((p: any) => p.seller?.username)
    .map((p: any) => entry(`/products/${p.seller!.username}/${p.slug}`, 0.8, p.updated_at))

  const competitionEntries = competitions.map((c: any) =>
    entry(`/competitions/${c.slug}`, 0.7, c.updated_at),
  )

  const communityEntries = communities.map((c: any) =>
    entry(`/c/${c.slug}`, 0.7, c.updated_at),
  )

  const courseEntries = courses.map((c: any) =>
    entry(`/courses/${c.slug}`, 0.7, c.updated_at),
  )

  const workshopEntries = workshops.map((w: any) =>
    entry(`/workshops/${w.slug}`, 0.7, w.updated_at),
  )

  return [
    ...staticEntries,
    ...artworkEntries,
    ...artistEntries,
    ...productEntries,
    ...competitionEntries,
    ...communityEntries,
    ...courseEntries,
    ...workshopEntries,
  ]
}
