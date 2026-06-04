import { RecommendationsRail } from "@/components/ai/RecommendationsRail"
import { Hero } from "@/components/home/Hero"
import { TrendingArtists } from "@/components/home/TrendingArtists"
import { FeaturedCollections } from "@/components/home/FeaturedCollections"
import { LiveCompetitions } from "@/components/home/LiveCompetitions"
import { CommunityHighlights } from "@/components/home/CommunityHighlights"
import { FeaturedReels } from "@/components/home/FeaturedReels"
import { UpcomingWorkshops } from "@/components/home/UpcomingWorkshops"
import { RecentlySold } from "@/components/home/RecentlySold"
import { ArtistOfTheWeek } from "@/components/home/ArtistOfTheWeek"
import { BestStudios } from "@/components/home/BestStudios"
import { Announcements } from "@/components/home/Announcements"
import { Testimonials } from "@/components/home/Testimonials"
import { listArtists } from "@/lib/data/artists"
import {
  getBestStudios,
  getHomepageAnnouncements,
  getHomepageTestimonials,
  getPromotedTrendingArtists,
} from "@/lib/data/homepage"
import type { MockArtist } from "@/lib/mock/artists"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  // Live-data-with-fallback for Trending Artists.
  // .catch() keeps the build alive when Railway is unreachable at build time.
  const [{ artists }, promoted, studios, announcements, testimonials] = await Promise.all([
    listArtists({ limit: 8 }).catch(() => ({ artists: [], count: 0 })),
    getPromotedTrendingArtists().catch(() => [] as MockArtist[]),
    getBestStudios(8).catch(() => []),
    getHomepageAnnouncements().catch(() => []),
    getHomepageTestimonials().catch(() => []),
  ])

  const fromDb: MockArtist[] = artists.map((a) => ({
    id: a.id,
    username: a.username ?? "anon",
    name: a.full_name ?? a.username ?? "Artist",
    tier: a.artist_profiles?.tier ?? "creator",
    specialty: a.artist_profiles?.specialty ?? "Artist",
    location: a.location ?? "",
    avatar: a.avatar_url ?? "/placeholder.svg",
    cover: a.cover_url ?? "/placeholder.svg",
    followers: 0,
    works: 0,
    verified: a.is_verified,
  }))

  // Admin-promoted artists lead the rail; de-dupe against the auto list.
  const seen = new Set(promoted.map((p) => p.id))
  const trending: MockArtist[] = [...promoted, ...fromDb.filter((a) => !seen.has(a.id))]

  return (
    <>
      <Hero />
      <RecommendationsRail />
      <TrendingArtists artists={trending.length > 0 ? trending : undefined} />
      <FeaturedCollections />
      <LiveCompetitions />
      <CommunityHighlights />
      <FeaturedReels />
      <UpcomingWorkshops />
      <RecentlySold />
      <BestStudios studios={studios} />
      <ArtistOfTheWeek />
      <Announcements items={announcements} />
      <Testimonials items={testimonials} />
    </>
  )
}
