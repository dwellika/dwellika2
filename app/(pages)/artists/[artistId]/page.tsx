import { notFound, redirect } from "next/navigation"

import { prisma } from "@/lib/prisma"

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
  const looksLikeUuid = /^[0-9a-fA-F-]{36}$/.test(artistId)

  const user = await prisma.user.findFirst({
    where: looksLikeUuid ? { id: artistId } : { username: artistId },
    select: { username: true },
  })

  if (!user?.username) notFound()
  redirect(`/u/${user.username}`)
}
