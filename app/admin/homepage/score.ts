// Pure scoring helper — kept out of the "use server" actions file so it can be
// imported by client components (a Server Action module may only export async fns).
//
// Artist Score weights (sum = 1.0):
//   0.35 portfolio + 0.20 engagement + 0.15 collection
// + 0.10 freshness + 0.10 storytelling + 0.10 diversity
export function computeArtistScore(s: {
  portfolio: number
  engagement: number
  collection: number
  freshness: number
  storytelling: number
  diversity: number
}): number {
  const score =
    0.35 * s.portfolio +
    0.2 * s.engagement +
    0.15 * s.collection +
    0.1 * s.freshness +
    0.1 * s.storytelling +
    0.1 * s.diversity
  return Math.round(score * 100) / 100
}
