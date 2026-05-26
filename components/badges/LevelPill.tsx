import { LevelBadge } from "./TierBadge"
import type { LevelProgress } from "@/lib/data/gamification"

export function LevelPill({ progress }: { progress: LevelProgress }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <LevelBadge level={progress.level} />
        <span className="text-xs tabular-nums text-muted-foreground">
          {progress.xp.toLocaleString()} XP
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent"
          style={{ width: `${Math.round(progress.progress * 100)}%` }}
        />
      </div>
      {progress.next ? (
        <p className="text-[10px] text-muted-foreground">
          {progress.xpToNext?.toLocaleString()} XP to {progress.next}
        </p>
      ) : (
        <p className="text-[10px] text-muted-foreground">Max level reached</p>
      )}
    </div>
  )
}
