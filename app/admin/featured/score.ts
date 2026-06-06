// Pure scoring helper — kept out of the "use server" actions file so it can be
// imported by client components (a Server Action module may only export async fns).
//
// Feature Score weights (sum = 1.0):
//   0.30 quality + 0.20 engagement + 0.15 sales + 0.15 freshness
// + 0.10 diversity + 0.10 curator
export function computeFeatureScore(s: {
  quality: number
  engagement: number
  sales: number
  freshness: number
  diversity: number
  curator: number
}): number {
  const score =
    0.3 * s.quality +
    0.2 * s.engagement +
    0.15 * s.sales +
    0.15 * s.freshness +
    0.1 * s.diversity +
    0.1 * s.curator
  return Math.round(score * 100) / 100
}
