import "server-only"

export function createAdminClient(): never {
  throw new Error("Supabase has been removed. Use Prisma directly instead.")
}
