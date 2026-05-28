export async function createClient(): Promise<never> {
  throw new Error("Supabase has been removed. Use Prisma + NextAuth instead.")
}
