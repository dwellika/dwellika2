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
import { Announcements } from "@/components/home/Announcements"
import { Testimonials } from "@/components/home/Testimonials"
import { listArtists } from "@/lib/data/artists"
import type { MockArtist } from "@/lib/mock/artists"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  // Live-data-with-fallback for Trending Artists. Other sections continue
  // to use mock fixtures until their domains are connected in Phase 3.
  // .catch() keeps the build alive when Railway is unreachable at build time.
  // ISR (revalidate=60) then fills real data on the first production request.
  const { artists } = await listArtists({ limit: 8 }).catch(() => ({ artists: [], count: 0 }))

  const trending: MockArtist[] = artists.map((a) => ({
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
      <ArtistOfTheWeek />
      <Announcements />
      <Testimonials />
    </>
  )
}
