import { Award } from "lucide-react"

interface Badge {
  slug: string
  name: string
  description: string | null
  icon_url: string | null
  tier: string | null
}

const TIER_COLOR: Record<string, string> = {
  bronze: "from-amber-700 to-amber-500",
  silver: "from-slate-400 to-slate-200",
  gold: "from-amber-400 to-yellow-200",
}

export function BadgeGrid({
  badges,
}: {
  badges: Array<{ badge: Badge | null; awarded_at: string }>
}) {
  if (!badges.length) {
    return (
      <p className="text-sm text-muted-foreground">No badges earned yet.</p>
    )
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {badges
        .filter((b) => b.badge)
        .map((b) => (
          <div
            key={b.badge!.slug}
            className="rounded-xl border border-border bg-card p-4 text-center"
          >
            <div
              className={`mx-auto mb-2 grid size-12 place-items-center rounded-full bg-gradient-to-br ${TIER_COLOR[b.badge!.tier ?? ""] ?? "from-primary to-accent"} text-white shadow-glow`}
            >
              <Award className="size-5" />
            </div>
            <p className="text-sm font-medium">{b.badge!.name}</p>
            {b.badge!.description ? (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {b.badge!.description}
              </p>
            ) : null}
          </div>
        ))}
    </div>
  )
}
