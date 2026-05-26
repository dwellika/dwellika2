import { Crown, Flame, Gem, Sparkles, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { ArtistTier, UserLevel } from "@/lib/types/database"

const TIER: Record<ArtistTier, { label: string; Icon: React.ElementType; tone: string }> = {
  beginner: { label: "Beginner", Icon: Sparkles, tone: "text-muted-foreground" },
  creator: { label: "Creator", Icon: Star, tone: "text-secondary" },
  professional: { label: "Pro", Icon: Flame, tone: "text-primary" },
  master: { label: "Master", Icon: Gem, tone: "text-accent" },
  legend: { label: "Legend", Icon: Crown, tone: "text-amber-400" },
}

const LEVEL: Record<UserLevel, { label: string; Icon: React.ElementType }> = {
  explorer: { label: "Explorer", Icon: Sparkles },
  collector: { label: "Collector", Icon: Star },
  patron: { label: "Patron", Icon: Gem },
  ambassador: { label: "Ambassador", Icon: Crown },
}

export function TierBadge({ tier }: { tier: ArtistTier }) {
  const t = TIER[tier]
  const Icon = t.Icon
  return (
    <Badge variant="secondary" className={`gap-1 backdrop-blur ${t.tone}`}>
      <Icon className="size-3" /> {t.label}
    </Badge>
  )
}

export function LevelBadge({ level }: { level: UserLevel }) {
  const l = LEVEL[level]
  const Icon = l.Icon
  return (
    <Badge variant="outline" className="gap-1">
      <Icon className="size-3" /> {l.label}
    </Badge>
  )
}
