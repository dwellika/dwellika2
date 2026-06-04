"use client"

import { useState, useTransition } from "react"
import { ImagePlus, Sparkles, X } from "lucide-react"
import { toast } from "sonner"

import { createArtwork } from "./actions"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

// ─── Constants ────────────────────────────────────────────────────────────────

const ARTWORK_TYPES = [
  { value: "2d_artwork",  label: "2D Artwork"  },
  { value: "3d_artwork",  label: "3D Artwork"  },
  { value: "home_decor",  label: "Home Decor"  },
  { value: "wearing_art", label: "Wearing Art" },
  { value: "other",       label: "Other"       },
]

const SIZES_2D = ["A1", "A2", "A3", "A4", "A5", "A6", "Custom"]

const MEDIUMS_2D = [
  "Oil", "Acrylic", "Watercolor", "Gouache", "Pastels", "Charcoal",
  "Graphite", "Ink", "Crayons", "Fresco", "Digital", "Vector",
  "Photography", "Mixed Media", "Other",
]

const STYLES_2D = [
  "Realism", "Photorealism", "Impressionism", "Expressionism", "Abstract",
  "Surrealism", "Cubism", "Pop Art", "Minimalism", "Art Nouveau",
  "Cyberpunk", "Anime", "Other",
]

const SUBJECTS_2D = [
  "Portrait", "Landscape", "Seascape", "Cityscape", "Still Life",
  "Wildlife", "Botanical", "Historical", "Fantasy", "Abstract", "Other",
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReelOption {
  id: string
  caption: string | null
  thumbnail_url: string | null
}

interface AiTags {
  medium?: string
  style?: string
  subject?: string
  colors?: string[]
  tags?: string[]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NewArtworkForm({ reels }: { reels: ReelOption[] }) {
  const [files, setFiles]       = useState<File[]>([])
  const [artworkType, setArtworkType] = useState("2d_artwork")
  // Multi-select arrays — an artwork can span several sizes/mediums/styles/subjects
  const [sizes, setSizes]       = useState<string[]>([])
  const [mediums, setMediums]   = useState<string[]>([])
  const [styles, setStyles]     = useState<string[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  // Free-text captured when "Other" is selected
  const [otherMedium, setOtherMedium]   = useState("")
  const [otherStyle, setOtherStyle]     = useState("")
  const [otherSubject, setOtherSubject] = useState("")
  const [reelId, setReelId]     = useState("")
  const [forSale, setForSale]   = useState(false)
  const [submit, setSubmit]     = useState(true)
  const [pending, startTransition] = useTransition()
  const [error, setError]       = useState<string | null>(null)
  const [aiTags, setAiTags]     = useState<AiTags | null>(null)
  const [aiPending, setAiPending] = useState(false)

  const is2D = artworkType === "2d_artwork"
  const showCustomDims = !is2D || sizes.includes("Custom") || sizes.length === 0

  const previews = files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }))

  function resetTypeFields() {
    setMediums([]); setStyles([]); setSubjects([]); setSizes([])
    setOtherMedium(""); setOtherStyle(""); setOtherSubject("")
  }

  // Joins selected pills, swapping the literal "Other" for the free-text value.
  function joinWithOther(arr: string[], other: string) {
    const out = arr.filter((x) => x !== "Other")
    if (arr.includes("Other") && other.trim()) out.push(other.trim())
    return out.join(", ")
  }

  async function runAiTagging() {
    if (!files[0]) return
    setAiPending(true)
    try {
      const reader = new FileReader()
      reader.readAsDataURL(files[0])
      reader.onloadend = async () => {
        const dataUrl = reader.result as string
        const res  = await fetch("/api/ai/tag", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ imageUrl: dataUrl }),
        })
        const json = await res.json()
        setAiPending(false)
        if (!res.ok || !json.ok) { toast.error(json.error ?? "AI tagging failed"); return }
        const tags = json.tags as AiTags
        setAiTags(tags)
        if (is2D) {
          const addUnique = (
            setter: React.Dispatch<React.SetStateAction<string[]>>,
            value: string,
          ) => setter((prev) => (prev.includes(value) ? prev : [...prev, value]))
          if (tags.medium  && MEDIUMS_2D.includes(tags.medium))   addUnique(setMediums, tags.medium)
          if (tags.style   && STYLES_2D.includes(tags.style))     addUnique(setStyles, tags.style)
          if (tags.subject && SUBJECTS_2D.includes(tags.subject)) addUnique(setSubjects, tags.subject)
        }
        toast.success("AI suggested tags ready — review and apply.")
      }
    } catch (e) {
      setAiPending(false)
      toast.error(e instanceof Error ? e.message : "AI failed")
    }
  }

  function applyAiTags() {
    if (!aiTags) return
    if (!is2D) {
      const setField = (name: string, value: string | undefined) => {
        const el = document.querySelector<HTMLInputElement>(`[name="${name}"]`)
        if (el && value) el.value = value
      }
      setField("medium", aiTags.medium)
      setField("style",  aiTags.style)
      setField("subject", aiTags.subject)
    }
    const tagsEl = document.querySelector<HTMLInputElement>(`[name="tags"]`)
    if (tagsEl && aiTags.tags?.length) tagsEl.value = aiTags.tags.join(", ")
    toast.success("Applied AI tags")
  }

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          setError(null)
          fd.set("artwork_type", artworkType)
          fd.set("reel_id", reelId === "none" ? "" : reelId)
          fd.set("for_sale", forSale ? "on" : "")
          fd.set("submit_for_review", submit ? "on" : "")
          // Inject multi-select values for 2D (comma-joined, "Other" → free text)
          if (is2D) {
            fd.set("size",    sizes.filter((s) => s !== "Custom").join(", "))
            fd.set("medium",  joinWithOther(mediums, otherMedium))
            fd.set("style",   joinWithOther(styles, otherStyle))
            fd.set("subject", joinWithOther(subjects, otherSubject))
          }
          for (const f of files) fd.append("media", f)
          const result = await createArtwork(fd)
          if (result?.ok === false) {
            setError(result.error)
            toast.error(result.error)
          }
        })
      }
      className="space-y-6"
    >
      {/* ── Type selector ── */}
      <Card>
        <CardHeader><CardTitle>Artwork type</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ARTWORK_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => { setArtworkType(t.value); resetTypeFields() }}
                className={
                  artworkType === t.value
                    ? "rounded-full border border-primary bg-primary/15 px-4 py-1.5 text-sm font-medium text-primary"
                    : "rounded-full border border-border bg-muted/30 px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Media ── */}
      <Card>
        <CardHeader><CardTitle>Media</CardTitle></CardHeader>
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
              onChange={(e) =>
                setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])].slice(0, 6))
              }
            />
          </label>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
              {previews.map((p, i) => (
                <div key={`${p.name}-${i}`} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
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
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {files.length > 0 && (
            <div className="space-y-2">
              <Button type="button" variant="outline" size="sm" onClick={runAiTagging} disabled={aiPending}>
                <Sparkles className="size-4" />
                {aiPending ? "Analyzing…" : "Suggest tags with AI"}
              </Button>
              {aiTags && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    {aiTags.medium  && <Pill label={aiTags.medium} />}
                    {aiTags.style   && <Pill label={aiTags.style} />}
                    {aiTags.subject && <Pill label={aiTags.subject} />}
                    {(aiTags.tags ?? []).map((t) => <Pill key={t} label={t} />)}
                  </div>
                  <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={applyAiTags}>
                    Apply suggestions
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Details ── */}
      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
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

          {is2D ? (
            /* 2D: structured multi-select pills (choose one or more) */
            <>
              <MultiSelectPills
                label="Size"
                hint="Select one or more — choose Custom to enter height × width."
                options={SIZES_2D}
                selected={sizes}
                onToggle={(v) =>
                  setSizes((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))
                }
              />

              <MultiSelectPills
                label="Medium"
                options={MEDIUMS_2D}
                selected={mediums}
                onToggle={(v) =>
                  setMediums((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))
                }
              />
              {mediums.includes("Other") && (
                <Input placeholder="Specify other medium(s)" value={otherMedium} onChange={(e) => setOtherMedium(e.target.value)} />
              )}

              <MultiSelectPills
                label="Style"
                options={STYLES_2D}
                selected={styles}
                onToggle={(v) =>
                  setStyles((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))
                }
              />
              {styles.includes("Other") && (
                <Input placeholder="Specify other style(s)" value={otherStyle} onChange={(e) => setOtherStyle(e.target.value)} />
              )}

              <MultiSelectPills
                label="Subject"
                options={SUBJECTS_2D}
                selected={subjects}
                onToggle={(v) =>
                  setSubjects((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))
                }
              />
              {subjects.includes("Other") && (
                <Input placeholder="Specify other subject(s)" value={otherSubject} onChange={(e) => setOtherSubject(e.target.value)} />
              )}

              {showCustomDims && (
                <div className="grid gap-4 md:grid-cols-3">
                  <FreeField label="Width"  name="dim_width"  type="number" placeholder="30" />
                  <FreeField label="Height" name="dim_height" type="number" placeholder="40" />
                  <div className="space-y-2">
                    <Label htmlFor="dim_unit">Unit</Label>
                    <Input id="dim_unit" name="dim_unit" defaultValue="cm" />
                  </div>
                </div>
              )}
            </>
          ) : (
            /* 3D / Home Decor / Wearing Art / Other: free-text */
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <FreeField label="Medium"  name="medium"  placeholder="Clay, Bronze, Resin…" />
                <FreeField label="Style"   name="style"   placeholder="Contemporary, Boho…"  />
                <FreeField label="Subject" name="subject" placeholder="Abstract, Figurative…"/>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <FreeField label="Width"  name="dim_width"  type="number" placeholder="30" />
                <FreeField label="Height" name="dim_height" type="number" placeholder="40" />
                <div className="space-y-2">
                  <Label htmlFor="dim_unit">Unit</Label>
                  <Input id="dim_unit" name="dim_unit" defaultValue="cm" />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              name="tags"
              placeholder="monsoon, blue, nature — comma separated"
            />
            <p className="text-xs text-muted-foreground">Up to 12 tags.</p>
          </div>
        </CardContent>
      </Card>

      {/* ── Reel attachment ── */}
      {reels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attach a reel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Link one of your approved reels so it plays on this artwork&apos;s page.
            </p>
            <Select value={reelId} onValueChange={setReelId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reel (optional)…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No reel</SelectItem>
                {reels.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.caption ? r.caption.slice(0, 60) : `Reel ${r.id.slice(0, 8)}…`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* ── Listing ── */}
      <Card>
        <CardHeader><CardTitle>Listing</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="block">List this work for sale</Label>
              <p className="text-xs text-muted-foreground">Buyers can add this to cart immediately.</p>
            </div>
            <Switch checked={forSale} onCheckedChange={setForSale} />
          </div>

          {forSale && (
            <div className="grid gap-4 md:grid-cols-2">
              <FreeField label="Price" name="price" type="number" required placeholder="12000" />
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" name="currency" defaultValue="INR" />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Switch id="prints_available" name="prints_available" />
            <Label htmlFor="prints_available" className="text-sm">Offer prints</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="custom_size_option" name="custom_size_option" />
            <Label htmlFor="custom_size_option" className="text-sm">Allow custom-size commissions</Label>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <Label className="block">Submit for review</Label>
              <p className="text-xs text-muted-foreground">
                Drafts stay private. Submitted pieces are reviewed before appearing publicly.
              </p>
            </div>
            <Switch checked={submit} onCheckedChange={setSubmit} />
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="submit" size="lg" disabled={pending || files.length === 0}>
          {pending ? "Uploading…" : submit ? "Submit for review" : "Save as draft"}
        </Button>
      </div>
    </form>
  )
}

function FreeField({ label, name, type = "text", placeholder, required }: {
  label: string; name: string; type?: string; placeholder?: string; required?: boolean
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

function MultiSelectPills({
  label,
  hint,
  options,
  selected,
  onToggle,
}: {
  label: string
  hint?: string
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label>{label} <span className="text-xs font-normal text-muted-foreground">(select one or more)</span></Label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={
                active
                  ? "rounded-full border border-primary bg-primary/15 px-3 py-1 text-xs font-medium text-primary"
                  : "rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              }
            >
              {opt}
            </button>
          )
        })}
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
