import { notFound, redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

interface ArtistPageProps {
  params: Promise<{ artistId: string }>
}

/**
 * Legacy route. The canonical profile path is /u/[username]. If the id
 * happens to be a real UUID we resolve to the username; otherwise treat
 * it as a username directly. Falls through to 404 if neither matches.
 */
export default async function LegacyArtistPage({ params }: ArtistPageProps) {
  const { artistId } = await params
  const supabase = await createClient()

  const looksLikeUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(artistId)
  const column = looksLikeUuid ? "id" : "username"

  const { data } = await supabase
    .from("profiles")
    .select("username")
    .eq(column, artistId)
    .maybeSingle()

  const username = (data as { username?: string | null } | null)?.username
  if (!username) notFound()
  redirect(`/u/${username}`)
}
