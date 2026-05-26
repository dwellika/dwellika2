"use client"

import Link from "next/link"
import { Heart, MessageCircle } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { SmartImage } from "@/components/ui/smart-image"
import { MOCK_COMMUNITY_POSTS } from "@/lib/mock/home"

import { Section } from "./Section"

export function CommunityHighlights() {
  return (
    <Section
      eyebrow="Communities"
      title="The best of the studios"
      description="Conversations, breakdowns, and behind-the-scenes from our most active communities."
      href="/communities"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {MOCK_COMMUNITY_POSTS.map((p) => (
          <Card key={p.id} className="group overflow-hidden">
            <Link href="/communities" className="block">
              <div className="relative h-48 w-full overflow-hidden">
                <SmartImage
                  src={p.image}
                  alt={p.title}
                  kind="community"
                  seed={p.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{p.community}</Badge>
                </div>
                <h3 className="line-clamp-2 font-display text-lg leading-snug">
                  {p.title}
                </h3>
                <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6">
                      <AvatarImage src={p.avatar} alt={p.author} />
                      <AvatarFallback>{p.author.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span>{p.author}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="size-3.5" /> {p.likes}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="size-3.5" /> {p.comments}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </Section>
  )
}
