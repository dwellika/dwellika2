"use client"

import { useState, useTransition } from "react"
import { ImagePlus, X } from "lucide-react"
import { toast } from "sonner"

import { submitEntry } from "@/lib/data/competition-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function SubmitForm({ competitionId }: { competitionId: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          fd.set("competition_id", competitionId)
          if (file) fd.set("media", file)
          const result = await submitEntry(fd)
          if (result && !result.ok) toast.error(result.error)
        })
      }
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required maxLength={120} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Statement</Label>
        <Textarea id="description" name="description" rows={3} maxLength={800} />
      </div>

      <div className="space-y-2">
        <Label>Artwork image</Label>
        {file ? (
          <div className="relative aspect-video overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={URL.createObjectURL(file)} alt="" className="size-full object-contain" />
            <button
              type="button"
              onClick={() => setFile(null)}
              className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-black/70 text-white"
              aria-label="Remove"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-border bg-muted/20 p-8 text-center transition-colors hover:bg-muted/40">
            <ImagePlus className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-2 text-sm">Click to upload your entry</p>
            <p className="text-xs text-muted-foreground">PNG · JPG · WEBP — up to 25 MB</p>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) setFile(f)
              }}
            />
          </label>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending || !file}>
          {pending ? "Submitting…" : "Submit entry"}
        </Button>
      </div>
    </form>
  )
}
