"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, Play, Sparkles, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SmartImage } from "@/components/ui/smart-image"

const FRAMES: Array<{
  src: string
  alt: string
  x: number
  y: number
  size: number
  depth: number
  rotate: number
}> = [
  {
    src: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&w=600&q=80",
    alt: "Watercolor still life",
    x: -28,
    y: -12,
    size: 220,
    depth: 0.6,
    rotate: -8,
  },
  {
    src: "https://images.unsplash.com/photo-1502691876148-a84978e59af8?auto=format&fit=crop&w=600&q=80",
    alt: "Oil portrait",
    x: 32,
    y: -18,
    size: 240,
    depth: 0.4,
    rotate: 6,
  },
  {
    src: "https://images.unsplash.com/photo-1554188248-986adbb73be4?auto=format&fit=crop&w=600&q=80",
    alt: "Digital painting",
    x: -36,
    y: 28,
    size: 200,
    depth: 0.9,
    rotate: 4,
  },
  {
    src: "https://images.unsplash.com/photo-1577720643272-265f09367456?auto=format&fit=crop&w=600&q=80",
    alt: "Sculpture",
    x: 38,
    y: 26,
    size: 210,
    depth: 0.75,
    rotate: -10,
  },
]

function sr(seed: number) {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

function Particles() {
  const dots = Array.from({ length: 36 }, (_, i) => i)
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {dots.map((i) => {
        // Round to a fixed precision so the server- and client-rendered strings
        // match exactly. Math.sin differs in its last digits between Node and the
        // browser, which otherwise triggers a hydration mismatch.
        const cx = (sr(i * 4) * 100).toFixed(3)
        const cy = (sr(i * 4 + 1) * 100).toFixed(3)
        const r = Number((sr(i * 4 + 2) * 1.5 + 0.5).toFixed(3))
        const delay = (sr(i * 4 + 3) * 8).toFixed(2)
        return (
          <circle
            key={i}
            cx={`${cx}%`}
            cy={`${cy}%`}
            r={r}
            className="fill-foreground/40"
            style={{
              animation: `glow-pulse 6s ease-in-out ${delay}s infinite`,
            }}
          />
        )
      })}
    </svg>
  )
}

export function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) return
    const el = ref.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      setMouse({ x, y })
    }
    el.addEventListener("mousemove", onMove)
    return () => el.removeEventListener("mousemove", onMove)
  }, [prefersReducedMotion])

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden md:min-h-[92vh]"
    >
      <div className="aurora-bg" aria-hidden="true" />
      <Particles />

      {/* Floating frames */}
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        {FRAMES.map((f, i) => (
          <motion.div
            key={f.src}
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              left: `calc(50% + ${f.x}vw)`,
              top: `calc(50% + ${f.y}vh)`,
              width: f.size,
              height: f.size,
              translate: `${-mouse.x * 24 * f.depth}px ${-mouse.y * 24 * f.depth}px`,
              transition: "translate 0.5s var(--ease-art)",
            }}
          >
            <motion.div
              animate={prefersReducedMotion ? undefined : {
                rotate: [f.rotate - 1, f.rotate + 1, f.rotate - 1],
                y: [0, -8, 0],
              }}
              transition={{
                duration: 6 + i,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl ring-1 ring-white/5"
              style={{ rotate: `${f.rotate}deg` }}
            >
              <SmartImage
                src={f.src}
                alt={f.alt}
                kind="artwork"
                seed={f.alt}
                fill
                sizes="240px"
                className="object-cover"
                priority={i < 2}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-background/40 via-transparent to-transparent" />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="container-page relative z-10 grid place-items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground backdrop-blur"
        >
          <Sparkles className="size-3.5 text-primary" /> Museum-grade marketplace
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-4xl font-display text-4xl leading-[1.05] sm:text-5xl md:text-7xl lg:text-8xl"
        >
          <span className="gradient-text">A living museum</span>
          <br />
          for artists and collectors.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 max-w-2xl text-balance text-base text-muted-foreground md:text-lg"
        >
          Discover originals, watch artists at work, join craft communities, and
          collect from a curated global gallery — all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild size="lg" className="group">
            <Link href="/shopping/arts">
              Explore Art
              <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/reels">
              <Play className="mr-1 size-4" /> Watch Reels
            </Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link href="/communities">
              <Users className="mr-1 size-4" /> Join Community
            </Link>
          </Button>
        </motion.div>

        {/* Stat ribbon */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-10 grid w-full max-w-3xl grid-cols-3 gap-3 text-center sm:mt-14 sm:gap-6"
        >
          <Stat value="12k+" label="Artists" />
          <Stat value="380k+" label="Artworks" />
          <Stat value="120+" label="Countries" />
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl sm:text-3xl md:text-4xl">{value}</p>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  )
}
