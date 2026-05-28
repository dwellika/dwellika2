import "server-only"
import { safeDb } from "@/lib/mongodb"

// ─── Event Types ─────────────────────────────────────────────────────────────

export type ReelEventType =
  | "view_start"
  | "view_end"
  | "skip"
  | "replay"
  | "like"
  | "unlike"
  | "comment"
  | "share"
  | "save"
  | "unsave"
  | "follow_click"
  | "buy_click"
  | "profile_click"
  | "mute"
  | "unmute"

export interface ReelEngagementEvent {
  reel_id: string
  user_id: string | null
  session_id: string
  event: ReelEventType
  watch_duration?: number // seconds actually watched
  completion_pct?: number // 0–100
  reel_duration?: number // total reel length in seconds
  ts: Date
  meta?: Record<string, unknown>
}

// ─── Track Event ──────────────────────────────────────────────────────────────

export async function trackReelEvent(
  event: Omit<ReelEngagementEvent, "ts">,
): Promise<void> {
  const db = await safeDb()
  if (!db) return

  await db.collection<ReelEngagementEvent>("reel_events").insertOne({
    ...event,
    ts: new Date(),
  })

  // Incrementally update score on key events
  if (event.event === "view_end" && event.completion_pct !== undefined) {
    await incrementReelScore(event.reel_id, {
      completion_pct: event.completion_pct,
      watch_duration: event.watch_duration ?? 0,
    })
  }

  if (event.event === "like") await addReelSignal(event.reel_id, "likes", 1)
  if (event.event === "unlike") await addReelSignal(event.reel_id, "likes", -1)
  if (event.event === "comment") await addReelSignal(event.reel_id, "comments", 1)
  if (event.event === "share") await addReelSignal(event.reel_id, "shares", 1)
  if (event.event === "save") await addReelSignal(event.reel_id, "saves", 1)
  if (event.event === "buy_click") await addReelSignal(event.reel_id, "buy_clicks", 1)
  if (event.event === "follow_click") await addReelSignal(event.reel_id, "follow_clicks", 1)
}

// ─── Score Helpers ────────────────────────────────────────────────────────────

async function incrementReelScore(
  reelId: string,
  data: { completion_pct: number; watch_duration: number },
) {
  const db = await safeDb()
  if (!db) return

  const isComplete = data.completion_pct >= 80

  await db.collection("reel_scores").updateOne(
    { reel_id: reelId },
    {
      $inc: {
        view_count: 1,
        total_watch_duration: data.watch_duration,
        complete_views: isComplete ? 1 : 0,
        total_completion_pct: data.completion_pct,
      },
      $set: { updated_at: new Date() },
      $setOnInsert: {
        reel_id: reelId,
        created_at: new Date(),
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        buy_clicks: 0,
        follow_clicks: 0,
        score: 0,
      },
    },
    { upsert: true },
  )

  // Recompute score after update
  await recomputeScore(reelId)
}

async function addReelSignal(reelId: string, field: string, delta: number) {
  const db = await safeDb()
  if (!db) return
  await db.collection("reel_scores").updateOne(
    { reel_id: reelId },
    { $inc: { [field]: delta }, $set: { updated_at: new Date() } },
    { upsert: true },
  )
  await recomputeScore(reelId)
}

async function recomputeScore(reelId: string) {
  const db = await safeDb()
  if (!db) return
  const doc = await db.collection("reel_scores").findOne({ reel_id: reelId })
  if (!doc) return

  const views = Math.max((doc.view_count as number) ?? 1, 1)
  const completionRate = ((doc.complete_views as number) ?? 0) / views
  const avgCompletion = ((doc.total_completion_pct as number) ?? 0) / views / 100

  // Weighted engagement score
  const engagementScore =
    avgCompletion * 0.3 +
    (((doc.likes as number) ?? 0) / views) * 0.22 +
    (((doc.shares as number) ?? 0) / views) * 0.16 +
    (((doc.comments as number) ?? 0) / views) * 0.1 +
    (((doc.saves as number) ?? 0) / views) * 0.1 +
    (((doc.buy_clicks as number) ?? 0) / views) * 0.08 +
    (((doc.follow_clicks as number) ?? 0) / views) * 0.04 +
    completionRate * 0.1 // bonus for high completion

  // Velocity bonus: log scale of view count
  const velocityBonus = Math.log1p(views) * 0.05

  const score = Math.min(engagementScore + velocityBonus, 1)

  await db.collection("reel_scores").updateOne(
    { reel_id: reelId },
    { $set: { score } },
  )
}

// ─── Feed Generation ──────────────────────────────────────────────────────────

export interface FeedOptions {
  userId: string | null
  limit: number
  excludeIds?: string[]
}

export async function getRankedReelIds(opts: FeedOptions): Promise<string[]> {
  const db = await safeDb()
  if (!db) return []

  const { userId, limit, excludeIds = [] } = opts

  // Get user's seen reels to exclude
  let seenIds: string[] = excludeIds
  if (userId) {
    const state = await db
      .collection("user_feed_state")
      .findOne({ user_id: userId })
    seenIds = [...excludeIds, ...((state?.seen_reels as string[]) ?? [])]
  }

  // Fetch top scored reels
  const scored = await db
    .collection("reel_scores")
    .find(
      seenIds.length > 0 ? { reel_id: { $nin: seenIds } } : {},
      {
        sort: { score: -1, view_count: -1 },
        limit: limit * 2,
        projection: { reel_id: 1 },
      },
    )
    .toArray()

  return scored.map((s) => s.reel_id as string)
}

// ─── User Feed State ──────────────────────────────────────────────────────────

export async function markReelSeen(
  userId: string,
  reelIds: string[],
): Promise<void> {
  if (!userId || reelIds.length === 0) return
  const db = await safeDb()
  if (!db) return

  await db.collection("user_feed_state").updateOne(
    { user_id: userId },
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      $push: { seen_reels: { $each: reelIds, $slice: -500 } as any },
      $set: { updated_at: new Date() },
      $setOnInsert: { user_id: userId, created_at: new Date() },
    },
    { upsert: true },
  )
}

export async function getUserInterests(userId: string) {
  const db = await safeDb()
  if (!db) return null
  return db.collection("user_interests").findOne({ user_id: userId })
}

export async function updateUserInterest(
  userId: string,
  tags: string[],
  delta = 1,
): Promise<void> {
  const db = await safeDb()
  if (!db) return

  const inc: Record<string, number> = {}
  for (const tag of tags) inc[`interests.${tag}`] = delta

  await db.collection("user_interests").updateOne(
    { user_id: userId },
    {
      $inc: inc,
      $set: { updated_at: new Date() },
      $setOnInsert: { user_id: userId, created_at: new Date() },
    },
    { upsert: true },
  )
}

// ─── Trending ─────────────────────────────────────────────────────────────────

export async function getTrendingReelIds(limit = 20): Promise<string[]> {
  const db = await safeDb()
  if (!db) return []

  // Check cache first (5 min TTL)
  const cached = await db.collection("trending_cache").findOne({
    created_at: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
  })
  if (cached?.reel_ids) return cached.reel_ids as string[]

  // Compute trending: high recent velocity (views in last 24h)
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const pipeline = [
    {
      $match: {
        ts: { $gte: cutoff },
        event: { $in: ["view_end", "like", "share"] },
      },
    },
    { $group: { _id: "$reel_id", events: { $sum: 1 } } },
    { $sort: { events: -1 } },
    { $limit: limit },
  ]

  const results = await db
    .collection("reel_events")
    .aggregate(pipeline)
    .toArray()
  const ids = results.map((r) => r._id as string)

  // Cache it
  await db.collection("trending_cache").deleteMany({})
  if (ids.length > 0) {
    await db.collection("trending_cache").insertOne({
      reel_ids: ids,
      created_at: new Date(),
    })
  }

  return ids
}
