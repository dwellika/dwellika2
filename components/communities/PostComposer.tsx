"use client"

import { useState, useTransition } from "react"
import { ImagePlus, X } from "lucide-react"
import { toast } from "sonner"

import { createPost } from "@/lib/data/community-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function PostComposer({ communityId }: { communityId: string }) {
  const [files, setFiles] = useState<File[]>([])
  const [pending, startTransition] = useTransition()

  return (
    <Card>
      <CardContent className="p-5">
        <form
          action={(fd) =>
            startTransition(async () => {
              fd.set("community_id", communityId)
              for (const f of files) fd.append("media", f)
              const result = await createPost(fd)
              if (result.ok) {
                toast.success("Posted to the community.")
                setFiles([])
                // Reset form via form.reset()
                const form = (document.activeElement as HTMLElement)?.closest("form")
                ;(form as HTMLFormElement | null)?.reset()
              } else {
                toast.error(result.error)
              }
            })
          }
          className="space-y-3"
        >
          <Input name="title" placeholder="Title (optional)" maxLength={120} />
          <Textarea name="body" rows={3} placeholder="Share something with the community…" maxLength={2000} />

          {files.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {files.map((f, i) => (
                <div
                  key={`${f.name}-${i}`}
                  className="group relative size-16 overflow-hidden rounded-md border border-border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(f)} alt={f.name} className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFiles((arr) => arr.filter((_, idx) => idx !== i))}
                    className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <ImagePlus className="size-4" />
              Add images
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                multiple
                className="hidden"
                onChange={(e) => {
                  const next = Array.from(e.target.files ?? [])
                  setFiles((prev) => [...prev, ...next].slice(0, 4))
                }}
              />
            </label>
            <Button type="submit" disabled={pending} size="sm">
              {pending ? "Posting…" : "Post"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
