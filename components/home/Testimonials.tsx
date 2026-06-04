"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { Quote } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MOCK_TESTIMONIALS } from "@/lib/mock/home"

import { Section } from "./Section"

export interface TestimonialItem {
  id: string
  group: "artist" | "seller" | "buyer"
  author: string
  role: string
  avatar: string | null
  body: string
}

const GROUPS = [
  { id: "artist", label: "Artists" },
  { id: "seller", label: "Sellers" },
  { id: "buyer", label: "Buyers" },
] as const

const MOCK_ITEMS: TestimonialItem[] = MOCK_TESTIMONIALS.map((t, i) => ({
  id: `mock-${i}`,
  group: t.group,
  author: t.author,
  role: t.role,
  avatar: t.avatar,
  body: t.body,
}))

function Carousel({
  items,
}: {
  items: { author: string; role: string; avatar: string | null; body: string }[]
}) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % items.length), 6000)
    return () => window.clearInterval(id)
  }, [items.length])

  const current = items[index]
  if (!current) return null

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.author}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-border bg-card/60">
            <CardContent className="space-y-6 p-8 md:p-10">
              <Quote className="size-8 text-primary" />
              <p className="text-balance font-display text-2xl leading-snug md:text-3xl">
                {current.body}
              </p>
              <div className="flex items-center gap-3">
                <Avatar className="size-12 ring-2 ring-primary/30">
                  <AvatarImage src={current.avatar ?? undefined} alt={current.author} />
                  <AvatarFallback>{current.author.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{current.author}</p>
                  <p className="text-xs text-muted-foreground">{current.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 flex justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Show testimonial ${i + 1}`}
            onClick={() => setIndex(i)}
            className={
              i === index
                ? "h-1.5 w-8 rounded-full bg-primary transition-all"
                : "h-1.5 w-4 rounded-full bg-border transition-all hover:bg-muted-foreground"
            }
          />
        ))}
      </div>
    </div>
  )
}

export function Testimonials({ items }: { items?: TestimonialItem[] } = {}) {
  const all = items && items.length > 0 ? items : MOCK_ITEMS
  return (
    <Section eyebrow="Loved by" title="The people who make Dwellika">
      <Tabs defaultValue="artist" className="mx-auto max-w-3xl">
        <TabsList className="mx-auto mb-8 w-fit">
          {GROUPS.map((g) => (
            <TabsTrigger key={g.id} value={g.id}>
              {g.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {GROUPS.map(({ id }) => {
          const groupItems = all.filter((t) => t.group === id)
          return (
            <TabsContent key={id} value={id}>
              {groupItems.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">No stories yet from this group.</p>
              ) : (
                <Carousel
                  items={groupItems.map((t) => ({
                    author: t.author,
                    role: t.role,
                    avatar: t.avatar,
                    body: t.body,
                  }))}
                />
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </Section>
  )
}
