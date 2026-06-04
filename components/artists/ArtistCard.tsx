"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { BadgeCheck, MapPin } from "lucide-react"

import { FollowButton } from "@/components/social/FollowButton"
import { TierBadge } from "@/components/badges/TierBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SmartImage } from "@/components/ui/smart-image"
import type { ArtistCardRow } from "@/lib/data/types"

interface ArtistCardProps {
  artist: ArtistCardRow
  followers?: number
  works?: number
  isFollowing?: boolean
  isAuthed?: boolean
}

export function ArtistCard({
  artist,
  followers = 0,
  works = 0,
  isFollowing = false,
  isAuthed = false,
}: ArtistCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const prefersReducedMotion = useReducedMotion()
  const router = useRouter()

  const onMove = (e: React.MouseEvent) => {
    if (prefersReducedMotion) return
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ rx: -y * 6, ry: x * 6 })
  }

  const initials =
    artist.full_name
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? artist.username?.slice(0, 2).toUpperCase() ?? "DW"

  const cover = artist.cover_url
  const tier = artist.artist_profiles?.tier

  // Canonical profile path is /u/[username]; fall back to the legacy
  // /artists/[id] resolver when a username is missing so the card always
  // navigates somewhere valid.
  const profileHref = artist.username ? `/u/${artist.username}` : `/artists/${artist.id}`

  return (
    <motion.article
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
      onClick={() => router.push(profileHref)}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: "transform 0.4s var(--ease-art)",
      }}
      className="group relative h-[360px] cursor-pointer overflow-hidden rounded-3xl border border-border bg-card shadow-xl"
    >
      <SmartImage
        src={cover}
        alt={artist.full_name ?? artist.username ?? "Artist cover"}
        kind="cover"
        seed={artist.full_name ?? artist.username ?? "artist"}
        fill
        sizes="(max-width: 768px) 100vw, 280px"
        className="object-cover opacity-90 transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="image-overlay-strong absolute inset-0" />
      <div
        aria-hidden="true"
        className="absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "conic-gradient(from 180deg at 50% 50%, hsl(var(--primary) / 0.3), transparent 35%, hsl(var(--accent) / 0.3) 60%, transparent 80%)",
          filter: "blur(20px)",
        }}
      />

      <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
        {tier ? <TierBadge tier={tier} /> : null}
        {artist.is_verified ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary backdrop-blur">
            <BadgeCheck className="size-3" /> Verified
          </span>
        ) : null}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 text-white">
        <div className="flex items-center gap-3">
          <Avatar className="size-12 ring-2 ring-white/70">
            <AvatarImage src={artist.avatar_url ?? undefined} alt={artist.full_name ?? ""} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Link
              href={profileHref}
              className="block truncate font-display text-lg leading-tight hover:underline"
            >
              {artist.full_name ?? `@${artist.username}`}
            </Link>
            <p className="truncate text-xs text-white/70">
              {artist.artist_profiles?.specialty ?? "Artist"}
              {artist.location ? (
                <>
                  {" "}
                  · <MapPin className="inline size-2.5" /> {artist.location}
                </>
              ) : null}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-white/10 px-3 py-2 backdrop-blur">
            <p className="font-display text-base">{followers.toLocaleString()}</p>
            <p className="text-[10px] uppercase tracking-widest text-white/60">Followers</p>
          </div>
          <div className="rounded-xl bg-white/10 px-3 py-2 backdrop-blur">
            <p className="font-display text-base">{works}</p>
            <p className="text-[10px] uppercase tracking-widest text-white/60">Works</p>
          </div>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <FollowButton
            targetUserId={artist.id}
            initial={isFollowing}
            isAuthed={isAuthed}
            size="sm"
            className="opacity-0 transition-opacity group-hover:opacity-100"
          />
        </div>
      </div>
    </motion.article>
  )
}
