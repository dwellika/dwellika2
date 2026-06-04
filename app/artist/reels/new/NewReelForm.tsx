"use client"

import { useState, useTransition } from "react"
import { Film, ImagePlus, X } from "lucide-react"
import { toast } from "sonner"

import { createReel } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface ArtworkOption {
  id: string
  title: string
}

export function NewReelForm({ artworks }: { artworks: ArtworkOption[] }) {
  const [video, setVideo] = useState<File | null>(null)
  const [thumb, setThumb] = useState<File | null>(null)
  const [artworkId, setArtworkId] = useState("none")
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const videoUrl = video ? URL.createObjectURL(video) : null

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          setError(null)
          if (video) fd.set("video", video)
          if (thumb) fd.set("thumbnail", thumb)
          fd.set("artwork_id", artworkId === "none" ? "" : artworkId)
          const result = await createReel(fd)
          if (result?.ok === false) {
            setError(result.error)
            toast.error(result.error)
          }
        })
      }
      className="space-y-6"
    >
      <Card>
        <CardHeader><CardTitle>Video</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {!video ? (
            <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-border bg-muted/20 p-8 text-center transition-colors hover:bg-muted/40">
              <Film className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-2 text-sm">Drop or click to upload a vertical video (9:16 works best)</p>
              <p className="text-xs text-muted-foreground">MP4 · WEBM · MOV</p>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="hidden"
                onChange={(e) => setVideo(e.target.files?.[0] ?? null)}
              />
            </label>
          ) : (
            <div className="relative mx-auto aspect-[9/16] w-48 overflow-hidden rounded-xl border border-border bg-black">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video src={videoUrl ?? undefined} className="size-full object-cover" controls />
              <button
                type="button"
                onClick={() => setVideo(null)}
                className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/70 text-white"
                aria-label="Remove video"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}

          <div className="space-y-2">
            <Label>Thumbnail (optional)</Label>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted/40">
              <ImagePlus className="size-3.5" /> {thumb ? thumb.name : "Choose image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setThumb(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea id="caption" name="caption" rows={3} maxLength={500} placeholder="Tell the story behind this clip…" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" name="tags" placeholder="timelapse, watercolor — comma separated" />
          </div>
          {artworks.length > 0 && (
            <div className="space-y-2">
              <Label>Link an artwork (optional)</Label>
              <Select value={artworkId} onValueChange={setArtworkId}>
                <SelectTrigger><SelectValue placeholder="No artwork" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No artwork</SelectItem>
                  {artworks.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={pending || !video}>
          {pending ? "Uploading…" : "Submit for review"}
        </Button>
      </div>
    </form>
  )
}
