"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { BadgeCheck, Sparkles, UserPlus } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SmartImage } from "@/components/ui/smart-image"
import type { MockArtist } from "@/lib/mock/artists"

const TIER_LABEL: Record<MockArtist["tier"], string> = {
  beginner: "Beginner",
  creator: "Creator",
  professional: "Pro",
  master: "Master",
  legend: "Legend",
}

export function ArtistTiltCard({ artist }: { artist: MockArtist }) {
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
    setTilt({ rx: -y * 8, ry: x * 8 })
  }

  return (
    <motion.article
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
      onClick={() => router.push(`/u/${artist.username}`)}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: "transform 0.4s var(--ease-art)",
      }}
      className="group relative h-[360px] w-[280px] shrink-0 cursor-pointer overflow-hidden rounded-3xl border border-border bg-card shadow-xl"
    >
      <SmartImage
        src={artist.cover}
        alt={`${artist.name} cover`}
        kind="cover"
        seed={artist.name}
        fill
        sizes="280px"
        className="object-cover opacity-90 transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="image-overlay-strong absolute inset-0" />
      <div
        aria-hidden="true"
        className="absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "conic-gradient(from 180deg at 50% 50%, hsl(var(--primary) / 0.35), transparent 35%, hsl(var(--accent) / 0.35) 60%, transparent 80%)",
          filter: "blur(20px)",
        }}
      />

      <div className="absolute left-4 top-4 flex gap-2">
        <Badge variant="secondary" className="gap-1 backdrop-blur">
          <Sparkles className="size-3" /> {TIER_LABEL[artist.tier]}
        </Badge>
        {artist.verified ? (
          <Badge variant="default" className="gap-1 backdrop-blur">
            <BadgeCheck className="size-3" /> Verified
          </Badge>
        ) : null}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 text-white">
        <div className="flex items-center gap-3">
          <Avatar className="size-12 ring-2 ring-white/70">
            <AvatarImage src={artist.avatar} alt={artist.name} />
            <AvatarFallback>{artist.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Link
              href={`/u/${artist.username}`}
              className="block truncate font-display text-lg leading-tight hover:underline"
            >
              {artist.name}
            </Link>
            <p className="truncate text-xs text-white/70">
              {artist.specialty} · {artist.location}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl bg-white/10 px-3 py-2 backdrop-blur">
            <p className="font-display text-base">
              {(artist.followers / 1000).toFixed(1)}k
            </p>
            <p className="text-[10px] uppercase tracking-widest text-white/60">Followers</p>
          </div>
          <div className="rounded-xl bg-white/10 px-3 py-2 backdrop-blur">
            <p className="font-display text-base">{artist.works}</p>
            <p className="text-[10px] uppercase tracking-widest text-white/60">Works</p>
          </div>
        </div>

        <Button
          asChild
          size="sm"
          className="mt-1 w-full opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1"
        >
          <Link href={`/u/${artist.username}`}>
            <UserPlus className="mr-1 size-3.5" /> Follow
          </Link>
        </Button>
      </div>
    </motion.article>
  )
}
