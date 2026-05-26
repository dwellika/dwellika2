"use client"

import { useRef, useState, useTransition } from "react"
import { Camera, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { uploadProfileImage } from "./actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { SmartImage } from "@/components/ui/smart-image"

interface UploaderProps {
  kind: "avatar" | "cover"
  initialUrl: string | null
  initials: string
}

export function ImageUploader({ kind, initialUrl, initials }: UploaderProps) {
  const [url, setUrl] = useState(initialUrl)
  const [pending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    const preview = URL.createObjectURL(file)
    setUrl(preview)

    const fd = new FormData()
    fd.set("file", file)
    fd.set("kind", kind)

    startTransition(async () => {
      const result = await uploadProfileImage(fd)
      if (result.ok) toast.success(`${kind === "avatar" ? "Avatar" : "Cover"} updated.`)
      else {
        setUrl(initialUrl)
        toast.error(result.error)
      }
    })
  }

  if (kind === "avatar") {
    return (
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={url ?? undefined} />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
            <span className="ml-2">Change avatar</span>
          </Button>
          <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WEBP — up to 5 MB.</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative h-44 w-full overflow-hidden rounded-xl border bg-muted/30">
        <SmartImage
          src={url}
          alt="Profile cover preview"
          kind="cover"
          seed={initials}
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
          <span className="ml-2">Change cover</span>
        </Button>
        <p className="text-xs text-muted-foreground">Recommended 1600×400 — up to 10 MB.</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
      </div>
    </div>
  )
}
