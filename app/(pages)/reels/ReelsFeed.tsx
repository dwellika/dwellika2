"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Heart, MessageCircle, Pause, Play, Share2, ShoppingBag, Volume2, VolumeX } from "lucide-react"

import { LikeButton, SaveButton } from "@/components/social/LikeSaveButtons"
import { FollowButton } from "@/components/social/FollowButton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { SmartImage } from "@/components/ui/smart-image"
import type { ReelWithCreator } from "@/lib/data/reels"

interface ReelsFeedProps {
  reels: ReelWithCreator[]
  isAuthed: boolean
}

export function ReelsFeed({ reels, isAuthed }: ReelsFeedProps) {
  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden bg-black">
      <div className="snap-y snap-mandatory overflow-y-scroll h-full w-full">
        {reels.map((r) => (
          <ReelItem key={r.id} reel={r} isAuthed={isAuthed} />
        ))}
      </div>
    </div>
  )
}

function ReelItem({ reel, isAuthed }: { reel: ReelWithCreator; isAuthed: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio > 0.7) {
            el.play().then(() => setPlaying(true)).catch(() => {})
          } else {
            el.pause()
            setPlaying(false)
          }
        }
      },
      { threshold: [0, 0.7, 1] },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const togglePlay = () => {
    const el = ref.current
    if (!el) return
    if (el.paused) {
      el.play().then(() => setPlaying(true)).catch(() => {})
    } else {
      el.pause()
      setPlaying(false)
    }
  }

  const initials =
    reel.creator?.full_name
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "DW"

  return (
    <section
      id={reel.id}
      className="relative grid h-[calc(100vh-4rem)] w-full snap-start place-items-center"
    >
      <div className="relative aspect-[9/16] h-full max-h-full max-w-[min(100vw,460px)] overflow-hidden bg-black">
        {reel.video_url ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            ref={ref}
            src={reel.video_url}
            poster={reel.thumbnail_url ?? undefined}
            playsInline
            loop
            muted={muted}
            preload="metadata"
            className="size-full object-cover"
            onClick={togglePlay}
          />
        ) : (
          <SmartImage
            src={reel.thumbnail_url}
            alt={reel.caption ?? "Reel"}
            kind="reel"
            seed={reel.caption ?? reel.id}
            fill
            sizes="460px"
            className="object-cover"
          />
        )}

        {/* Gradient overlays */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/85 to-transparent" />

        {/* Top controls */}
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="bg-black/40 text-white backdrop-blur hover:bg-black/60"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </Button>
        </div>

        {/* Play indicator */}
        {!playing && reel.video_url ? (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute inset-0 grid place-items-center"
            aria-label="Play"
          >
            <span className="grid size-16 place-items-center rounded-full bg-white/20 backdrop-blur">
              {playing ? <Pause className="size-7 text-white" /> : <Play className="size-7 text-white" />}
            </span>
          </button>
        ) : null}

        {/* Side actions */}
        <div className="absolute bottom-24 right-3 flex flex-col items-center gap-3 text-white">
          <LikeButton
            targetKind="reel"
            targetId={reel.id}
            initial={false}
            count={reel.like_count}
            isAuthed={isAuthed}
            variant="ghost"
            className="!h-auto !p-2 rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60"
          />
          <span className="rounded-full bg-black/40 px-2 py-1 text-xs backdrop-blur">
            <MessageCircle className="size-4" />
          </span>
          <SaveButton
            targetKind="reel"
            targetId={reel.id}
            initial={false}
            isAuthed={isAuthed}
            className="rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60"
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60"
            onClick={() => {
              if (typeof navigator !== "undefined" && "share" in navigator) {
                navigator.share?.({ title: reel.caption ?? "Reel", url: location.href })
              }
            }}
            aria-label="Share"
          >
            <Share2 className="size-4" />
          </Button>
        </div>

        {/* Bottom info */}
        <div className="absolute inset-x-0 bottom-0 z-10 space-y-3 p-4 text-white">
          <div className="flex items-center gap-3">
            <Link href={`/u/${reel.creator?.username}`} className="flex items-center gap-2">
              <Avatar className="size-8 ring-2 ring-white/40">
                <AvatarImage src={reel.creator?.avatar_url ?? undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="font-medium">@{reel.creator?.username}</span>
            </Link>
            {reel.creator ? (
              <FollowButton
                targetUserId={reel.creator.id}
                initial={false}
                isAuthed={isAuthed}
                size="sm"
                variant="outline"
                className="ml-auto border-white/60 text-white"
              />
            ) : null}
          </div>

          {reel.caption ? <p className="line-clamp-2 text-sm">{reel.caption}</p> : null}

          {reel.artwork ? (
            <Link
              href={`/artworks/${reel.creator?.username}/${reel.artwork.slug}`}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
            >
              <ShoppingBag className="size-3.5" />
              {reel.artwork.for_sale && reel.artwork.price
                ? `Buy ₹${Number(reel.artwork.price).toLocaleString()}`
                : "View artwork"}
            </Link>
          ) : reel.product ? (
            <Link
              href={`/products/${reel.creator?.username}/${reel.product.slug}`}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
            >
              <ShoppingBag className="size-3.5" />
              Shop ₹{Number(reel.product.price).toLocaleString()}
            </Link>
          ) : null}

          {/* Tag for like count visualization */}
          {reel.like_count > 0 ? (
            <div className="flex items-center gap-1 text-xs text-white/70">
              <Heart className="size-3.5" /> {reel.like_count.toLocaleString()} likes
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
