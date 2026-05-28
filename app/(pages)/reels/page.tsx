import { getCurrentUser } from "@/lib/auth/rbac"
import { listReels } from "@/lib/data/reels"
import { MOCK_REELS } from "@/lib/mock/home"
import type { ReelWithCreator } from "@/lib/data/reels"
import { ReelsFeed } from "./ReelsFeed"

export const metadata = {
  title: "Reels",
  description: "Watch artists create. Discover art. Buy direct.",
  openGraph: {
    type: "website",
    title: "Reels — Dwellika",
    description: "Watch artists create. Discover art. Buy direct.",
  },
}

export const dynamic = "force-dynamic"

export default async function ReelsPage() {
  const [viewer, reels] = await Promise.all([
    getCurrentUser(),
    listReels({ limit: 15 }),
  ])

  const initialReels: ReelWithCreator[] =
    reels.length > 0
      ? reels
      : MOCK_REELS.map((r, i) => ({
        id: r.id,
        creator_id: `mock-${i}`,
        video_url: "",
        thumbnail_url: r.thumbnail,
        caption: r.title,
        duration_sec: 30,
        width: 720,
        height: 1280,
        artwork_id: null,
        product_id: null,
        tags: ["art", "studio"],
        status: "approved",
        view_count: r.views,
        like_count: Math.floor(r.views * 0.1),
        comment_count: Math.floor(r.views * 0.02),
        share_count: Math.floor(r.views * 0.01),
        published_at: new Date(),
        created_at: new Date(),
        creator: {
          id: `mock-${i}`,
          username: r.creator.toLowerCase().replace(/\s+/g, "_"),
          full_name: r.creator,
          avatar_url: null,
          is_verified: i < 2,
        },
        artwork: null,
        product: null,
      }))

  return (
    <ReelsFeed
      initialReels={initialReels}
      isAuthed={Boolean(viewer)}
      currentUserId={viewer?.id}
    />
  )
}
