"use client"

import Image, { type ImageProps } from "next/image"
import { useMemo, useState } from "react"
import {
  Brush,
  Camera,
  Compass,
  Film,
  GraduationCap,
  Image as ImageIcon,
  Mic,
  Package,
  Palette,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

export type SmartImageKind =
  | "artwork"
  | "product"
  | "reel"
  | "cover"
  | "community"
  | "course"
  | "workshop"
  | "competition"
  | "avatar"
  | "generic"

type BaseProps = Omit<ImageProps, "src" | "onError" | "alt"> & {
  src: string | null | undefined
  alt: string
  kind?: SmartImageKind
  seed?: string | null
  fallbackClassName?: string
}

const KIND_ICON: Record<SmartImageKind, LucideIcon> = {
  artwork: Palette,
  product: Package,
  reel: Film,
  cover: Camera,
  community: Users,
  course: GraduationCap,
  workshop: Mic,
  competition: Trophy,
  avatar: ImageIcon,
  generic: Compass,
}

// Six theme-derived gradient pairs (terracotta / sage / ochre families).
// Uses CSS variables so they re-tune automatically with light/dark.
const GRADIENTS = [
  "linear-gradient(135deg, hsl(var(--primary) / 0.55), hsl(var(--secondary) / 0.55))",
  "linear-gradient(135deg, hsl(var(--accent) / 0.55), hsl(var(--primary) / 0.45))",
  "linear-gradient(135deg, hsl(var(--secondary) / 0.55), hsl(var(--accent) / 0.45))",
  "linear-gradient(135deg, hsl(var(--primary) / 0.4), hsl(var(--accent) / 0.55))",
  "linear-gradient(135deg, hsl(var(--secondary) / 0.5), hsl(var(--primary) / 0.45))",
  "linear-gradient(135deg, hsl(var(--accent) / 0.5), hsl(var(--secondary) / 0.5))",
]

function hashSeed(seed: string | null | undefined): number {
  if (!seed) return 0
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function getMonogram(seed: string | null | undefined): string {
  if (!seed) return ""
  const parts = seed
    .trim()
    .split(/[\s_\-.]+/)
    .filter(Boolean)
  if (!parts.length) return seed.slice(0, 1).toUpperCase()
  const letters = parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
  return letters.toUpperCase()
}

export function ImageFallbackTile({
  kind = "generic",
  seed,
  className,
  showIcon = true,
}: {
  kind?: SmartImageKind
  seed?: string | null
  className?: string
  showIcon?: boolean
}) {
  const idx = hashSeed(seed ?? kind) % GRADIENTS.length
  const Icon = KIND_ICON[kind] ?? Brush
  const monogram = getMonogram(seed)

  return (
    <div
      aria-hidden
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        className,
      )}
      style={{ background: GRADIENTS[idx] }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgb(255 255 255 / 0.18) 1px, transparent 1px)",
          backgroundSize: "10px 10px",
        }}
      />
      {monogram ? (
        <span className="font-display text-3xl font-semibold tracking-wide text-white/90 drop-shadow">
          {monogram}
        </span>
      ) : showIcon ? (
        <Icon className="size-8 text-white/85 drop-shadow" />
      ) : null}
    </div>
  )
}

export function SmartImage({
  src,
  alt,
  kind = "generic",
  seed,
  className,
  fallbackClassName,
  fill,
  ...rest
}: BaseProps) {
  const [broken, setBroken] = useState(false)

  const safeSrc = useMemo(() => {
    if (!src) return ""
    return src
  }, [src])

  if (!safeSrc || broken) {
    return (
      <ImageFallbackTile
        kind={kind}
        seed={seed ?? alt}
        className={cn(fill && "absolute inset-0", className, fallbackClassName)}
      />
    )
  }

  return (
    <Image
      {...rest}
      fill={fill}
      src={safeSrc}
      alt={alt}
      className={className}
      onError={() => setBroken(true)}
    />
  )
}
