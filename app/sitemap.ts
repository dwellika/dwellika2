import type { MetadataRoute } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

const STATIC_PATHS = [
  "",
  "/artists",
  "/shopping/arts",
  "/shopping/decor-items",
  "/shopping/art-supplies",
  "/reels",
  "/communities",
  "/competitions",
  "/workshops",
  "/terms",
  "/privacy",
  "/cookies",
  "/accessibility",
]

export default function sitemap(): MetadataRoute.Sitemap {
  return STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }))
}
