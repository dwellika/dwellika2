"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  BadgeCheck,
  Bookmark,
  ChevronDown,
  Heart,
  Loader2,
  MessageCircle,
  Music,
  Pause,
  Play,
  Send,
  Share2,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  UserPlus,
  Volume2,
  VolumeX,
  X,
} from "lucide-react"

import { toggleLike, toggleSave, toggleFollow } from "@/lib/data/social-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { SmartImage } from "@/components/ui/smart-image"
import { cn } from "@/lib/utils"
import type { ReelWithCreator } from "@/lib/data/reels"

// ─── Types ────────────────────────────────────────────────────────────────────

interface CommentUser {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
}

interface CommentItem {
  id: string
  body: string
  like_count: number
  created_at: string
  user: CommentUser | null
  replies?: CommentItem[]
}

interface FloatingHeart {
  id: number
  x: number
  y: number
}

// ─── Session ID (generated once) ─────────────────────────────────────────────

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr"
  const key = "__dwellika_sid"
  let sid = sessionStorage.getItem(key)
  if (!sid) {
    sid =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem(key, sid)
  }
  return sid
}

// ─── Main Feed Component ──────────────────────────────────────────────────────

interface ReelsFeedProps {
  initialReels: ReelWithCreator[]
  isAuthed: boolean
  currentUserId?: string
}

export function ReelsFeed({
  initialReels,
  isAuthed,
  currentUserId,
}: ReelsFeedProps) {
  const [reels, setReels] = useState<ReelWithCreator[]>(initialReels)
  const [activeIndex, setActiveIndex] = useState(0)
  const [globalMuted, setGlobalMuted] = useState(true)
  const [cursor, setCursor] = useState(initialReels.length)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [commentReelId, setCommentReelId] = useState<string | null>(null)
  const [shareReelId, setShareReelId] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const sessionId = useRef(getSessionId())

  // Infinite scroll sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 },
    )
    obs.observe(sentinel)
    return () => obs.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, cursor])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const res = await fetch(`/api/reels/feed?cursor=${cursor}&mode=personalized`)
      const data = await res.json()
      if (data.ok && data.reels?.length) {
        setReels((prev) => {
          const existingIds = new Set(prev.map((r) => r.id))
          const fresh = (data.reels as ReelWithCreator[]).filter(
            (r) => !existingIds.has(r.id),
          )
          return [...prev, ...fresh]
        })
        setCursor(data.nextCursor)
        setHasMore(data.hasMore)
      } else {
        setHasMore(false)
      }
    } catch {
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, cursor])

  const commentReel = reels.find((r) => r.id === commentReelId) ?? null
  const shareReel = reels.find((r) => r.id === shareReelId) ?? null

  return (
    <>
      {/* Feed container */}
      <div
        className="fixed inset-0 z-50 bg-black md:static md:z-auto md:h-[calc(100dvh-4rem)]"
        style={{ overflow: "hidden" }}
      >
        <div
          className="h-full w-full snap-y snap-mandatory overflow-y-scroll"
          style={{ scrollbarWidth: "none" }}
        >
          {reels.map((reel, index) => (
            <ReelItem
              key={reel.id}
              reel={reel}
              index={index}
              isAuthed={isAuthed}
              currentUserId={currentUserId}
              globalMuted={globalMuted}
              onMuteToggle={() => setGlobalMuted((m) => !m)}
              onActive={() => setActiveIndex(index)}
              isActive={index === activeIndex}
              sessionId={sessionId.current}
              onOpenComments={() => setCommentReelId(reel.id)}
              onOpenShare={() => setShareReelId(reel.id)}
            />
          ))}

          {/* Loading skeleton */}
          {loading && (
            <div className="flex h-[100dvh] snap-start items-center justify-center bg-black md:h-[calc(100dvh-4rem)]">
              <Loader2 className="size-8 animate-spin text-white/60" />
            </div>
          )}

          {/* Sentinel for infinite scroll */}
          <div ref={sentinelRef} className="h-4 snap-start" />

          {!hasMore && reels.length > 0 && (
            <div className="flex h-32 snap-start items-center justify-center text-sm text-white/40">
              You&apos;ve seen all reels
            </div>
          )}
        </div>
      </div>

      {/* Comments Drawer */}
      {commentReelId && commentReel && (
        <CommentsDrawer
          reel={commentReel}
          isAuthed={isAuthed}
          onClose={() => setCommentReelId(null)}
        />
      )}

      {/* Share Modal */}
      {shareReelId && shareReel && (
        <ShareModal
          reel={shareReel}
          onClose={() => setShareReelId(null)}
        />
      )}
    </>
  )
}

// ─── Individual Reel Item ─────────────────────────────────────────────────────

interface ReelItemProps {
  reel: ReelWithCreator
  index: number
  isAuthed: boolean
  currentUserId?: string
  globalMuted: boolean
  onMuteToggle: () => void
  onActive: () => void
  isActive: boolean
  sessionId: string
  onOpenComments: () => void
  onOpenShare: () => void
}

function ReelItem({
  reel,
  index,
  isAuthed,
  currentUserId,
  globalMuted,
  onMuteToggle,
  onActive,
  isActive,
  sessionId,
  onOpenComments,
  onOpenShare,
}: ReelItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [playing, setPlaying] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(reel.like_count)
  const [saved, setSaved] = useState(false)
  const [followed, setFollowed] = useState(false)
  const [showPlayPause, setShowPlayPause] = useState(false)
  const [showMuteHint, setShowMuteHint] = useState(false)
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([])
  const [commentCount, setCommentCount] = useState(reel.comment_count)

  // Double-tap detection
  const lastTapRef = useRef(0)
  const heartCounterRef = useRef(0)

  // Watch time tracking
  const watchStartRef = useRef<number | null>(null)
  const watchedSecondsRef = useRef(0)

  // IntersectionObserver for autoplay
  useEffect(() => {
    const el = videoRef.current
    const container = containerRef.current
    if (!el || !container) return

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio >= 0.7) {
            onActive()
            if (reel.video_url) {
              // Set src lazily when entering view
              if (!el.src && reel.video_url) {
                el.src = reel.video_url
              }
              el.play().then(() => {
                setPlaying(true)
                watchStartRef.current = Date.now()
              }).catch(() => {})
            }
          } else {
            if (!el.paused) {
              el.pause()
              setPlaying(false)
              // Accumulate watched time
              if (watchStartRef.current !== null) {
                watchedSecondsRef.current +=
                  (Date.now() - watchStartRef.current) / 1000
                watchStartRef.current = null
              }
            }
          }
        }
      },
      { threshold: [0, 0.7, 1] },
    )

    obs.observe(container)
    return () => obs.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reel.video_url])

  // Send analytics when leaving active state
  useEffect(() => {
    if (!isActive) {
      sendViewAnalytics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  // Cleanup: send analytics on unmount
  useEffect(() => {
    return () => {
      sendViewAnalytics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function sendViewAnalytics() {
    const el = videoRef.current
    const duration = el?.duration ?? reel.duration_sec ?? 0
    const watched = watchedSecondsRef.current
    if (watched < 1) return

    const completionPct =
      duration > 0 ? Math.min(Math.round((watched / duration) * 100), 100) : 0

    const payload = JSON.stringify({
      event: "view_end",
      sessionId,
      watchDuration: Math.round(watched),
      completionPct,
      tags: reel.tags,
    })

    // Use sendBeacon for reliability
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      navigator.sendBeacon(
        `/api/reels/${reel.id}/view`,
        new Blob([payload], { type: "application/json" }),
      )
    } else {
      fetch(`/api/reels/${reel.id}/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {})
    }

    watchedSecondsRef.current = 0
    watchStartRef.current = null
  }

  // Preload strategy based on proximity to active
  function getPreload(): "auto" | "metadata" | "none" {
    if (isActive) return "auto"
    if (index <= (index + 2)) return "metadata"
    return "none"
  }

  const togglePlay = useCallback(() => {
    const el = videoRef.current
    if (!el || !reel.video_url) return
    if (el.paused) {
      if (!el.src) el.src = reel.video_url
      el.play().then(() => {
        setPlaying(true)
        watchStartRef.current = Date.now()
      }).catch(() => {})
    } else {
      el.pause()
      setPlaying(false)
      if (watchStartRef.current !== null) {
        watchedSecondsRef.current += (Date.now() - watchStartRef.current) / 1000
        watchStartRef.current = null
      }
    }
    // Show indicator briefly
    setShowPlayPause(true)
    setTimeout(() => setShowPlayPause(false), 600)
  }, [reel.video_url])

  const handleDoubleTap = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const now = Date.now()
      const delta = now - lastTapRef.current
      lastTapRef.current = now

      if (delta < 350) {
        // Double tap — spawn heart at tap position
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const id = ++heartCounterRef.current

        setFloatingHearts((prev) => [...prev, { id, x, y }])
        setTimeout(() => {
          setFloatingHearts((prev) => prev.filter((h) => h.id !== id))
        }, 900)

        // Like if not already liked
        if (!liked) {
          setLiked(true)
          setLikeCount((c) => c + 1)
          if (isAuthed) {
            toggleLike("reel", reel.id).catch(() => {
              setLiked(false)
              setLikeCount((c) => c - 1)
            })
          }
        }
      } else {
        // Single tap — toggle play
        togglePlay()
      }
    },
    [liked, isAuthed, reel.id, togglePlay],
  )

  const handleLike = async () => {
    if (!isAuthed) return
    const next = !liked
    setLiked(next)
    setLikeCount((c) => c + (next ? 1 : -1))
    const res = await toggleLike("reel", reel.id)
    if (!res.ok) {
      setLiked(!next)
      setLikeCount((c) => c + (next ? -1 : 1))
    }
  }

  const handleSave = async () => {
    if (!isAuthed) return
    const next = !saved
    setSaved(next)
    const res = await toggleSave("reel", reel.id)
    if (!res.ok) setSaved(!next)
  }

  const handleFollow = async () => {
    if (!isAuthed || !reel.creator) return
    const next = !followed
    setFollowed(next)
    const res = await toggleFollow(reel.creator.id)
    if (!res.ok) setFollowed(!next)
  }

  const handleMuteToggle = () => {
    onMuteToggle()
    setShowMuteHint(true)
    setTimeout(() => setShowMuteHint(false), 1200)
  }

  const initials =
    reel.creator?.full_name
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "DW"

  const showBuy =
    (reel.artwork?.for_sale && Boolean(reel.artwork?.price)) ||
    Boolean(reel.product?.price)
  const buyHref = reel.artwork
    ? `/artworks/${reel.creator?.username}/${reel.artwork.slug}`
    : reel.product
      ? `/products/${reel.creator?.username}/${reel.product.slug}`
      : "#"
  const buyLabel = reel.artwork
    ? `Buy ₹${Number(reel.artwork.price).toLocaleString()}`
    : `Shop ₹${Number(reel.product?.price ?? 0).toLocaleString()}`

  return (
    <section
      id={reel.id}
      ref={containerRef}
      className="relative flex h-[100dvh] w-full snap-start items-center justify-center bg-black md:h-[calc(100dvh-4rem)]"
    >
      {/* Video / Thumbnail */}
      <div className="relative h-full w-full max-w-[min(100vw,430px)] overflow-hidden bg-black md:aspect-[9/16] md:h-full md:max-h-full md:rounded-2xl">
        {reel.video_url ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            ref={videoRef}
            poster={reel.thumbnail_url ?? undefined}
            playsInline
            loop
            muted={globalMuted}
            preload={getPreload()}
            className="size-full object-cover"
          />
        ) : (
          <SmartImage
            src={reel.thumbnail_url}
            alt={reel.caption ?? "Reel"}
            kind="reel"
            seed={reel.caption ?? reel.id}
            fill
            sizes="430px"
            className="object-cover"
          />
        )}

        {/* Tap overlay for play/pause + double-tap like */}
        <div
          className="absolute inset-0"
          onClick={handleDoubleTap}
          role="button"
          tabIndex={0}
          aria-label="Tap to play/pause, double tap to like"
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") togglePlay()
          }}
        />

        {/* Gradient overlays */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/90 to-transparent" />

        {/* Top badges row */}
        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2">
          {reel._isTrending && (
            <span className="flex items-center gap-1 rounded-full bg-orange-500/90 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur">
              <TrendingUp className="size-3" />
              Trending
            </span>
          )}
          {reel._isRecommended && (
            <span className="flex items-center gap-1 rounded-full bg-purple-600/90 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur">
              <Sparkles className="size-3" />
              For You
            </span>
          )}
        </div>

        {/* Mute button */}
        <button
          type="button"
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
          onClick={(e) => {
            e.stopPropagation()
            handleMuteToggle()
          }}
          aria-label={globalMuted ? "Unmute" : "Mute"}
        >
          {globalMuted ? (
            <VolumeX className="size-4" />
          ) : (
            <Volume2 className="size-4" />
          )}
        </button>

        {/* Mute hint overlay */}
        {showMuteHint && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="rounded-xl bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur">
              {globalMuted ? "Muted" : "Sound on"}
            </span>
          </div>
        )}

        {/* Play / Pause indicator */}
        {showPlayPause && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="grid size-16 place-items-center rounded-full bg-white/20 backdrop-blur">
              {playing ? (
                <Pause className="size-7 text-white" />
              ) : (
                <Play className="size-7 text-white" />
              )}
            </span>
          </div>
        )}

        {/* Floating hearts from double-tap */}
        {floatingHearts.map((heart) => (
          <span
            key={heart.id}
            className="pointer-events-none absolute animate-bounce text-3xl"
            style={{
              left: heart.x - 16,
              top: heart.y - 16,
              animation: "floatUp 0.9s ease-out forwards",
            }}
          >
            ❤️
          </span>
        ))}

        {/* Right side action buttons */}
        <div className="absolute bottom-32 right-3 flex flex-col items-center gap-4 md:bottom-28" style={{ bottom: "max(8rem, calc(6rem + env(safe-area-inset-bottom, 0px)))" }}>
          {/* Like */}
          <div className="flex flex-col items-center gap-0.5">
            <button
              type="button"
              className={cn(
                "flex size-11 items-center justify-center rounded-full backdrop-blur transition",
                liked
                  ? "bg-red-500/90 text-white"
                  : "bg-black/40 text-white hover:bg-black/60",
              )}
              onClick={(e) => {
                e.stopPropagation()
                handleLike()
              }}
              aria-label="Like"
            >
              <Heart
                className={cn("size-5 transition-transform", liked && "scale-110 fill-current")}
              />
            </button>
            <span className="text-xs font-medium text-white drop-shadow">
              {formatCount(likeCount)}
            </span>
          </div>

          {/* Comment */}
          <div className="flex flex-col items-center gap-0.5">
            <button
              type="button"
              className="flex size-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
              onClick={(e) => {
                e.stopPropagation()
                onOpenComments()
              }}
              aria-label="Comments"
            >
              <MessageCircle className="size-5" />
            </button>
            <span className="text-xs font-medium text-white drop-shadow">
              {formatCount(commentCount)}
            </span>
          </div>

          {/* Share */}
          <div className="flex flex-col items-center gap-0.5">
            <button
              type="button"
              className="flex size-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
              onClick={(e) => {
                e.stopPropagation()
                onOpenShare()
              }}
              aria-label="Share"
            >
              <Share2 className="size-5" />
            </button>
            <span className="text-xs font-medium text-white drop-shadow">
              {formatCount(reel.share_count)}
            </span>
          </div>

          {/* Save */}
          <button
            type="button"
            className={cn(
              "flex size-11 items-center justify-center rounded-full backdrop-blur transition",
              saved
                ? "bg-yellow-500/90 text-white"
                : "bg-black/40 text-white hover:bg-black/60",
            )}
            onClick={(e) => {
              e.stopPropagation()
              handleSave()
            }}
            aria-label="Save"
          >
            <Bookmark
              className={cn("size-5", saved && "fill-current")}
            />
          </button>
        </div>

        {/* Bottom info overlay */}
        <div className="absolute inset-x-0 bottom-0 z-10 space-y-2 px-4 pb-8 text-white md:pb-6" style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom, 2rem))" }}>
          {/* BUY CTA */}
          {showBuy && (
            <Link
              href={buyHref}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90"
              onClick={(e) => e.stopPropagation()}
            >
              <ShoppingBag className="size-3.5" />
              {buyLabel}
            </Link>
          )}

          {/* Creator row */}
          <div className="flex items-end gap-3">
            <div className="flex-1 min-w-0">
              <Link
                href={`/u/${reel.creator?.username}`}
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Avatar className="size-9 ring-2 ring-white/50">
                  <AvatarImage src={reel.creator?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1 min-w-0">
                  <span className="truncate text-sm font-semibold">
                    @{reel.creator?.username ?? "artist"}
                  </span>
                  {reel.creator?.is_verified && (
                    <BadgeCheck className="size-4 shrink-0 text-blue-400" />
                  )}
                </div>
              </Link>
            </div>

            {/* Follow button */}
            {reel.creator && reel.creator.id !== currentUserId && (
              <button
                type="button"
                className={cn(
                  "shrink-0 flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition",
                  followed
                    ? "border-white/60 bg-white/20 text-white"
                    : "border-white text-white hover:bg-white/20",
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  handleFollow()
                }}
              >
                {followed ? (
                  "Following"
                ) : (
                  <>
                    <UserPlus className="size-3" />
                    Follow
                  </>
                )}
              </button>
            )}
          </div>

          {/* Caption */}
          {reel.caption && (
            <p className="line-clamp-3 text-sm leading-snug drop-shadow">
              {reel.caption}
            </p>
          )}

          {/* Hashtags */}
          {reel.tags.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
              {reel.tags.slice(0, 6).map((tag) => (
                <span
                  key={tag}
                  className="shrink-0 text-xs font-medium text-blue-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Audio line */}
          <div className="flex items-center gap-2 text-xs text-white/70">
            <Music className="size-3 shrink-0" />
            <span className="truncate">
              Original audio · @{reel.creator?.username ?? "artist"}
            </span>
          </div>
        </div>
      </div>

      {/* Floating heart animation styles */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: scale(1) translateY(0); opacity: 1; }
          50%  { transform: scale(1.5) translateY(-40px); opacity: 0.9; }
          100% { transform: scale(0.8) translateY(-100px); opacity: 0; }
        }
      `}</style>
    </section>
  )
}

// ─── Comments Drawer ──────────────────────────────────────────────────────────

interface CommentsDrawerProps {
  reel: ReelWithCreator
  isAuthed: boolean
  onClose: () => void
}

function CommentsDrawer({ reel, isAuthed, onClose }: CommentsDrawerProps) {
  const [comments, setComments] = useState<CommentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState("")
  const [posting, setPosting] = useState(false)
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Slide in after mount
  useEffect(() => {
    requestAnimationFrame(() => setOpen(true))
    fetchComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchComments() {
    setLoading(true)
    try {
      const res = await fetch(`/api/reels/${reel.id}/comments`)
      const data = await res.json()
      if (data.ok) setComments(data.comments)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim() || posting) return
    setPosting(true)
    try {
      const res = await fetch(`/api/reels/${reel.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      })
      const data = await res.json()
      if (data.ok && data.comment) {
        setComments((prev) => [data.comment, ...prev])
        setBody("")
      }
    } catch {
      // silent
    } finally {
      setPosting(false)
    }
  }

  function closeWithAnimation() {
    setOpen(false)
    setTimeout(onClose, 300)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={closeWithAnimation}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-[70] flex max-h-[85dvh] flex-col rounded-t-2xl bg-neutral-950 transition-transform duration-300 md:max-h-[75dvh]",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        {/* Handle */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="mx-auto h-1 w-10 rounded-full bg-white/20" />
        </div>

        <div className="flex items-center justify-between px-4 pb-3">
          <h2 className="text-base font-semibold text-white">
            Comments{" "}
            {comments.length > 0 && (
              <span className="text-sm font-normal text-white/50">
                ({comments.length})
              </span>
            )}
          </h2>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full text-white/60 hover:text-white"
            onClick={closeWithAnimation}
            aria-label="Close comments"
          >
            <ChevronDown className="size-5" />
          </button>
        </div>

        {/* Comment list */}
        <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-white/40" />
            </div>
          ) : comments.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/40">
              No comments yet. Be the first!
            </p>
          ) : (
            comments.map((c) => (
              <CommentRow key={c.id} comment={c} />
            ))
          )}
        </div>

        {/* Input */}
        <div className="border-t border-white/10 px-4 py-3">
          {isAuthed ? (
            <form
              onSubmit={handlePost}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Add a comment…"
                className="flex-1 rounded-full bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:ring-1 focus:ring-white/30"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!body.trim() || posting}
                className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40 transition"
                aria-label="Post comment"
              >
                {posting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </button>
            </form>
          ) : (
            <p className="text-center text-sm text-white/50">
              <Link
                href="/signin"
                className="text-white underline underline-offset-2"
              >
                Sign in
              </Link>{" "}
              to comment
            </p>
          )}
        </div>
      </div>
    </>
  )
}

function CommentRow({ comment }: { comment: CommentItem }) {
  const initials =
    comment.user?.full_name
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "??"

  return (
    <div className="flex gap-3">
      <Avatar className="size-8 shrink-0">
        <AvatarImage src={comment.user?.avatar_url ?? undefined} />
        <AvatarFallback className="text-xs bg-white/10 text-white">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-white">
            @{comment.user?.username ?? "user"}
          </span>
          <span className="text-xs text-white/40">
            {timeAgo(comment.created_at)}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-white/90 leading-snug">
          {comment.body}
        </p>
        {comment.like_count > 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs text-white/40">
            <Heart className="size-3" />
            {comment.like_count}
          </div>
        )}
        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 ml-2 space-y-2 border-l border-white/10 pl-3">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="flex gap-2">
                <Avatar className="size-6 shrink-0">
                  <AvatarImage src={reply.user?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-[10px] bg-white/10 text-white">
                    {reply.user?.full_name?.[0] ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-white">
                    @{reply.user?.username ?? "user"}
                  </span>
                  <p className="text-xs text-white/80 leading-snug mt-0.5">
                    {reply.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Share Modal ──────────────────────────────────────────────────────────────

interface ShareModalProps {
  reel: ReelWithCreator
  onClose: () => void
}

function ShareModal({ reel, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setOpen(true))
  }, [])

  function closeWithAnimation() {
    setOpen(false)
    setTimeout(onClose, 250)
  }

  const reelUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/reels?r=${reel.id}`
      : `/reels?r=${reel.id}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(reelUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  async function nativeShare() {
    if (!("share" in navigator)) return
    try {
      await navigator.share({
        title: reel.caption ?? "Check out this reel on Dwellika",
        text: reel.caption ?? "Watch this art reel on Dwellika",
        url: reelUrl,
      })
    } catch {
      // user cancelled or not supported
    }
  }

  const shareOptions = [
    { label: "Copy link", icon: "🔗", action: copyLink },
    ...(typeof navigator !== "undefined" && "share" in navigator
      ? [{ label: "Share via…", icon: "📤", action: nativeShare }]
      : []),
    {
      label: "Share to Instagram",
      icon: "📸",
      action: () => {
        window.open(`https://www.instagram.com/`, "_blank")
      },
    },
    {
      label: "Share to Twitter",
      icon: "🐦",
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(reelUrl)}&text=${encodeURIComponent(reel.caption ?? "Check out this reel")}`,
          "_blank",
        )
      },
    },
    {
      label: "Share to WhatsApp",
      icon: "💬",
      action: () => {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${reel.caption ?? "Check out this reel"} ${reelUrl}`)}`,
          "_blank",
        )
      },
    },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-250",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={closeWithAnimation}
      />

      {/* Modal */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-[70] rounded-t-2xl bg-neutral-950 transition-transform duration-250",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <h2 className="text-base font-semibold text-white">Share</h2>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full text-white/60 hover:text-white"
            onClick={closeWithAnimation}
            aria-label="Close share"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Reel preview */}
        <div className="mx-4 mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
          {reel.thumbnail_url ? (
            <div className="relative size-14 overflow-hidden rounded-lg shrink-0">
              <SmartImage
                src={reel.thumbnail_url}
                alt={reel.caption ?? "Reel"}
                kind="reel"
                seed={reel.id}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {reel.caption ?? "Untitled reel"}
            </p>
            <p className="text-xs text-white/50">
              by @{reel.creator?.username ?? "artist"}
            </p>
          </div>
        </div>

        {/* Share options */}
        <div className="px-4 pb-6 space-y-1">
          {shareOptions.map((opt) => (
            <button
              key={opt.label}
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-white transition hover:bg-white/10"
              onClick={opt.action}
            >
              <span className="text-lg">{opt.icon}</span>
              <span className="flex-1">{opt.label}</span>
              {opt.label === "Copy link" && copied && (
                <span className="text-xs text-green-400">Copied!</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d`
  return new Date(dateStr).toLocaleDateString()
}
