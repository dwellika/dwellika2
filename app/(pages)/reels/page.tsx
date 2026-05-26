import Link from "next/link"

import { getCurrentUser } from "@/lib/auth/rbac"
import { listReels } from "@/lib/data/reels"
import { MOCK_REELS } from "@/lib/mock/home"
import type { ReelWithCreator } from "@/lib/data/reels"

import { ReelsFeed } from "./ReelsFeed"

export const metadata = {
  title: "Reels",
  description: "Vertical reels from the world&apos;s best studios.",
}

export default async function ReelsPage() {
  const viewer = await getCurrentUser()
  const reels = await listReels({ limit: 20 })

  if (reels.length === 0) {
    // Fall back to mock so the page isn't empty before content arrives.
    const fallback: ReelWithCreator[] = MOCK_REELS.map((r, i) => ({
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
      tags: [],
      status: "approved",
      view_count: r.views,
      like_count: 0,
      comment_count: 0,
      share_count: 0,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      creator: {
        id: `mock-${i}`,
        username: r.creator.toLowerCase().replace(/\s+/g, "_"),
        full_name: r.creator,
        avatar_url: null,
      },
    }))
    return (
      <>
        <ReelsFeed reels={fallback} isAuthed={Boolean(viewer)} />
        <div className="container-page pb-16 text-center text-xs text-muted-foreground">
          Showing placeholder reels — no published reels in your project yet.{" "}
          <Link href="/artist/dashboard" className="underline">
            Upload one
          </Link>
        </div>
      </>
    )
  }

  return <ReelsFeed reels={reels} isAuthed={Boolean(viewer)} />
}
