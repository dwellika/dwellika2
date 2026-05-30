"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { updateProfile } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ProfileFormProps {
  initial: {
    username:   string
    full_name:  string
    bio:        string
    website:    string
    location:   string
    interests:  string
    pinterest:  string
    instagram:  string
    behance:    string
    artstation: string
  }
}

export function ProfileForm({ initial }: ProfileFormProps) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          setError(null)
          const result = await updateProfile(fd)
          if (result.ok) toast.success("Profile saved.")
          else setError(result.error)
        })
      }
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            defaultValue={initial.username}
            placeholder="lowercase, numbers, underscore"
            pattern="^[a-z0-9_]{3,32}$"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" defaultValue={initial.full_name} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={400}
          defaultValue={initial.bio}
          placeholder="A short artist statement. 400 characters max."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            type="url"
            defaultValue={initial.website}
            placeholder="https://"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={initial.location} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="interests">Interests</Label>
        <Input
          id="interests"
          name="interests"
          defaultValue={initial.interests}
          placeholder="watercolor, sculpture, digital — comma separated"
        />
        <p className="text-xs text-muted-foreground">Up to 12 interests.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pinterest">Pinterest</Label>
          <Input
            id="pinterest"
            name="pinterest"
            defaultValue={initial.pinterest}
            placeholder="https://pinterest.com/you"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input id="instagram" name="instagram" defaultValue={initial.instagram} placeholder="handle" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="behance">Behance</Label>
          <Input id="behance" name="behance" defaultValue={initial.behance} placeholder="profile URL" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="artstation">ArtStation</Label>
          <Input id="artstation" name="artstation" defaultValue={initial.artstation} placeholder="profile URL" />
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">{error}</p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  )
}
