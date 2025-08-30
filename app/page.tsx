"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

// Animated SVG background
function FloatingPaths({ position = 1 }: { position?: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full text-slate-900" viewBox="0 0 696 316" fill="none" aria-hidden="true">
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.08 + path.id * 0.02}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{ pathLength: 1, opacity: [0.3, 0.6, 0.3], pathOffset: [0, 1, 0] }}
            transition={{ duration: 20 + Math.random() * 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
        ))}
      </svg>
    </div>
  )
}

export default function HomePage() {
  const title = "Dwellika live soon"
  const subtitle = "Good thing take time"
  const cta = "Ready for live"

  const words = title.split(" ")

  return (
    <main className="relative min-h-[80vh] w-full overflow-hidden">
      {/* Warm craft-inspired solid backdrop */}
      <div className="absolute inset-0 bg-[rgb(246,240,232)]" />

      {/* Animated vector paths */}
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      {/* Content */}
      <section className="relative z-10 container mx-auto px-4 md:px-6 flex min-h-[80vh] items-center justify-center text-center">
        <div className="w-full max-w-3xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-sm text-slate-700 shadow-sm backdrop-blur"
          >
            <span className="inline-block size-2 rounded-full bg-amber-500" aria-hidden="true" />
            Coming soon
          </motion.div>

          {/* Title */}
          <h1 className="mt-6 text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter mb-4">
            {words.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block mr-3 last:mr-0">
                {word.split("").map((letter, letterIndex) => (
                  <motion.span
                    key={`${wordIndex}-${letterIndex}`}
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: wordIndex * 0.12 + letterIndex * 0.03,
                      type: "spring",
                      stiffness: 150,
                      damping: 22,
                    }}
                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-700/90 mb-8">{subtitle}</p>

          {/* CTA */}
          <div className="inline-block group relative p-px rounded-2xl bg-gradient-to-b from-black/10 to-white/20 shadow-lg">
            <Button
              className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-all group-hover:-translate-y-0.5"
              asChild
            >
              <a href="#notify" aria-label="Get notified when Dwellika goes live">
                {cta} <span className="ml-2 opacity-80 group-hover:opacity-100 transition-opacity">→</span>
              </a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
