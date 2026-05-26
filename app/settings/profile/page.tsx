import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { ImageUploader } from "./ImageUploader"
import { ProfileForm } from "./ProfileForm"

export const metadata = { title: "Profile — Settings" }

export default async function ProfileSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/signin?next=/settings/profile")

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "username, full_name, avatar_url, cover_url, bio, website, location, interests, socials",
    )
    .eq("id", user.id)
    .single<{
      username: string | null
      full_name: string | null
      avatar_url: string | null
      cover_url: string | null
      bio: string | null
      website: string | null
      location: string | null
      interests: string[]
      socials: Record<string, string>
    }>()

  const socials = profile?.socials ?? {}

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
    (profile?.username ?? user.email ?? "DW").slice(0, 2).toUpperCase()

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
