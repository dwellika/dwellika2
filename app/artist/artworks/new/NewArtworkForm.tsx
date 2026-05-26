"use client"

import { useState, useTransition } from "react"
import { ImagePlus, Sparkles, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

import { createArtwork } from "./actions"

interface AiTags {
  medium?: string
  style?: string
  subject?: string
  colors?: string[]
  tags?: string[]
}

export function NewArtworkForm() {
  const [files, setFiles] = useState<File[]>([])
  const [forSale, setForSale] = useState(false)
  const [submit, setSubmit] = useState(true)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [aiTags, setAiTags] = useState<AiTags | null>(null)
  const [aiPending, setAiPending] = useState(false)

  const previews = files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }))

  const runAiTagging = async () => {
    if (!files[0]) return
    setAiPending(true)
    try {
      // Upload to a data URL since we don't have a public URL yet; the AI tag
      // endpoint accepts any HTTPS URL. We use base64 inline (OpenAI vision
      // supports data URLs).
      const reader = new FileReader()
      reader.readAsDataURL(files[0])
      reader.onloadend = async () => {
        const dataUrl = reader.result as string
        const res = await fetch("/api/ai/tag", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ imageUrl: dataUrl }),
        })
        const json = await res.json()
        setAiPending(false)
        if (!res.ok || !json.ok) {
          toast.error(json.error ?? "AI tagging failed")
          return
        }
        setAiTags(json.tags as AiTags)
        toast.success("AI suggested tags ready — review and apply.")
      }
    } catch (e) {
      setAiPending(false)
      toast.error(e instanceof Error ? e.message : "AI failed")
    }
  }

  const applyAiTags = () => {
    if (!aiTags) return
    const setField = (name: string, value: string | undefined) => {
      const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`)
      if (el && value) el.value = value
    }
    setField("medium", aiTags.medium)
    setField("style", aiTags.style)
    setField("subject", aiTags.subject)
    setField("tags", (aiTags.tags ?? []).join(", "))
    toast.success("Applied AI tags")
  }

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          setError(null)
          for (const f of files) fd.append("media", f)
          fd.set("for_sale", forSale ? "on" : "")
          fd.set("submit_for_review", submit ? "on" : "")
          const result = await createArtwork(fd)
          if (result && !("ok" in result && result.ok === false)) {
            // redirected
          } else if (result && result.ok === false) {
            setError(result.error)
            toast.error(result.error)
          }
        })
      }
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-border bg-muted/20 p-8 text-center transition-colors hover:bg-muted/40">
            <ImagePlus className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-2 text-sm">Drop or click to upload — up to 25 MB each</p>
            <p className="text-xs text-muted-foreground">PNG · JPG · WEBP · AVIF</p>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              multiple
              className="hidden"
              onChange={(e) => {
                const next = Array.from(e.target.files ?? [])
                setFiles((prev) => [...prev, ...next].slice(0, 6))
              }}
            />
          </label>

          {previews.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
              {previews.map((p, i) => (
                <div
                  key={`${p.name}-${i}`}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.name} className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFiles((arr) => arr.filter((_, idx) => idx !== i))}
                    className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove"
                  >
                    <X className="size-3" />
                  </button>
                  {i === 0 ? (
                    <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                      Primary
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {files.length > 0 ? (
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={runAiTagging}
                disabled={aiPending}
              >
                <Sparkles className="size-4" />
                {aiPending ? "Analyzing…" : "Suggest tags with AI"}
              </Button>
              {aiTags ? (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    {aiTags.medium ? <Pill label={aiTags.medium} /> : null}
                    {aiTags.style ? <Pill label={aiTags.style} /> : null}
                    {aiTags.subject ? <Pill label={aiTags.subject} /> : null}
                    {(aiTags.tags ?? []).map((t) => (
                      <Pill key={t} label={t} />
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={applyAiTags}
                  >
                    Apply suggestions
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required maxLength={120} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Artist statement</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              maxLength={2000}
              placeholder="What is this piece about? What materials did you use?"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Medium" name="medium" placeholder="Watercolor, Oil…" />
            <Field label="Style" name="style" placeholder="Abstract, Realism…" />
            <Field label="Subject" name="subject" placeholder="Landscape, Portrait…" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              name="tags"
              placeholder="monsoon, blue, nature — comma separated"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Width" name="dim_width" type="number" placeholder="30" />
            <Field label="Height" name="dim_height" type="number" placeholder="40" />
            <div className="space-y-2">
              <Label htmlFor="dim_unit">Unit</Label>
              <Input id="dim_unit" name="dim_unit" defaultValue="cm" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="block">List this work for sale</Label>
              <p className="text-xs text-muted-foreground">Buyers can add this to cart immediately.</p>
            </div>
            <Switch checked={forSale} onCheckedChange={setForSale} />
          </div>

          {forSale ? (
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Price" name="price" type="number" required placeholder="12000" />
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" name="currency" defaultValue="INR" />
              </div>
              <Field label="Edition size" name="edition_size" type="number" placeholder="1" />
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <Switch id="prints_available" name="prints_available" />
            <Label htmlFor="prints_available" className="text-sm">
              Offer prints
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="custom_size_option" name="custom_size_option" />
            <Label htmlFor="custom_size_option" className="text-sm">
              Allow custom-size commissions
            </Label>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <Label className="block">Submit for review</Label>
              <p className="text-xs text-muted-foreground">
                Drafts stay private. Submitted pieces are reviewed by moderators
                before appearing publicly.
              </p>
            </div>
            <Switch checked={submit} onCheckedChange={setSubmit} />
          </div>
        </CardContent>
      </Card>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button type="submit" size="lg" disabled={pending || files.length === 0}>
          {pending ? "Uploading…" : submit ? "Submit for review" : "Save as draft"}
        </Button>
      </div>
    </form>
  )
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} placeholder={placeholder} required={required} />
    </div>
  )
}

function Pill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
      {label}
    </span>
  )
}
