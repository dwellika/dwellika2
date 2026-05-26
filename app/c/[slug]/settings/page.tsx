import { notFound, redirect } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/lib/auth/rbac"
import { getCommunityBySlug, getMembership } from "@/lib/data/communities"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function CommunitySettingsPage({ params }: PageProps) {
  const { slug } = await params
  const community = await getCommunityBySlug(slug)
  if (!community) notFound()

  const viewer = await getCurrentUser()
  if (!viewer) redirect(`/signin?next=/c/${slug}/settings`)

  const role = await getMembership(community.id, viewer.id)
  const isModerator = role === "owner" || role === "moderator" || viewer.role === "admin" || viewer.role === "super_admin"
  if (!isModerator) redirect("/403")

  return (
    <div className="container-page py-12">
      <h1 className="mb-8 font-display text-4xl">Manage {community.name}</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Cover, description, and category.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Editing community details is coming in Phase 4 alongside the admin
              console. For now, contact the Dwellika team to change cover or
              description.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Members & moderators</CardTitle>
            <CardDescription>Promote, demote, or remove members.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Member management UI ships in Phase 4. Use the admin console to
              moderate posts under <code>/admin/moderation</code>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
