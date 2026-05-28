import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { ImageUploader } from "./ImageUploader"
import { ProfileForm } from "./ProfileForm"

export const metadata = { title: "Profile — Settings" }

export default async function ProfileSettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin?next=/settings/profile")

  const profile = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      username: true,
      full_name: true,
      avatar_url: true,
      cover_url: true,
      bio: true,
      website: true,
      location: true,
      interests: true,
      socials: true,
    },
  })

  const socials = (profile?.socials as Record<string, string> | null) ?? {}

  const initial = {
    username: profile?.username ?? "",
    full_name: profile?.full_name ?? "",
    bio: profile?.bio ?? "",
    website: profile?.website ?? "",
    location: profile?.location ?? "",
    interests: (profile?.interests ?? []).join(", "),
    twitter: socials.twitter ?? "",
    instagram: socials.instagram ?? "",
    behance: socials.behance ?? "",
    artstation: socials.artstation ?? "",
  }

  const initials =
    (profile?.full_name ?? "")
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    (profile?.username ?? session.user.email ?? "DW").slice(0, 2).toUpperCase()

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Public profile</CardTitle>
          <CardDescription>
            How you appear across Dwellika — in your portfolio, reels, and community posts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <ImageUploader kind="cover" initialUrl={profile?.cover_url ?? null} initials={initials} />
          <Separator />
          <ImageUploader kind="avatar" initialUrl={profile?.avatar_url ?? null} initials={initials} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>
            Tell collectors and the community who you are and what you make.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm initial={initial} />
        </CardContent>
      </Card>
    </div>
  )
}
