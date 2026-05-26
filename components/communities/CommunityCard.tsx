import Link from "next/link"
import { Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { SmartImage } from "@/components/ui/smart-image"
import type { CommunityRow } from "@/lib/data/communities"

export function CommunityCard({ community }: { community: CommunityRow }) {
  return (
    <Link href={`/c/${community.slug}`}>
      <article className="group h-full overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-glow">
        <div className="relative h-32 w-full overflow-hidden">
          <SmartImage
            src={community.cover_url}
            alt={community.name}
            kind="community"
            seed={community.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="space-y-2 p-4">
          <div className="flex items-center gap-2">
            <h3 className="line-clamp-1 font-display text-lg">{community.name}</h3>
            {community.category ? <Badge variant="outline">{community.category}</Badge> : null}
          </div>
          {community.description ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">{community.description}</p>
          ) : null}
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="size-3.5" /> {community.member_count.toLocaleString()} members
          </p>
        </div>
      </article>
    </Link>
  )
}
