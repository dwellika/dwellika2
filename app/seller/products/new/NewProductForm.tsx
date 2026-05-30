"use client"

import { useState, useTransition } from "react"
import { ImagePlus, X } from "lucide-react"
import { toast } from "sonner"

import { createProduct } from "./actions"
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

const CATEGORIES = [
  { value: "art_supplies",  label: "Art Supplies"  },
  { value: "home_decor",    label: "Home Decor"    },
  { value: "wearing_arts",  label: "Wearing Art"   },
]

export function NewProductForm() {
  const [files, setFiles]     = useState<File[]>([])
  const [category, setCategory] = useState("art_supplies")
  const [submit, setSubmit]   = useState(true)
  const [pending, startTransition] = useTransition()
  const [error, setError]     = useState<string | null>(null)

  const previews = files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }))

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          setError(null)
          fd.set("category", category)
          fd.set("submit_for_review", submit ? "on" : "")
          for (const f of files) fd.append("media", f)
          const result = await createProduct(fd)
          if (result?.ok === false) {
            setError(result.error)
            toast.error(result.error)
          }
        })
      }
      className="space-y-6"
    >
      {/* ── Photos ── */}
      <Card>
        <CardHeader><CardTitle>Product photos</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-border bg-muted/20 p-8 text-center transition-colors hover:bg-muted/40">
            <ImagePlus className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-2 text-sm">Drop or click to upload — up to 25 MB each</p>
            <p className="text-xs text-muted-foreground">PNG · JPG · WEBP</p>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
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
        </CardContent>
      </Card>

      {/* ── Details ── */}
      <Card>
        <CardHeader><CardTitle>Product details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
            <Input id="title" name="title" required maxLength={120} placeholder="e.g. Professional Watercolor Set 24 Colours" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              maxLength={2000}
              placeholder="Materials, dimensions, usage, care instructions…"
            />
          </div>

          <div className="space-y-2">
            <Label>Category <span className="text-destructive">*</span></Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              name="tags"
              placeholder="brushes, watercolor, professional — comma separated"
            />
            <p className="text-xs text-muted-foreground">Up to 12 tags improve search visibility.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU <span className="text-xs text-muted-foreground">(optional)</span></Label>
            <Input id="sku" name="sku" placeholder="Your internal product code" />
          </div>
        </CardContent>
      </Card>

      {/* ── Pricing & Inventory ── */}
      <Card>
        <CardHeader><CardTitle>Pricing & inventory</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price <span className="text-destructive">*</span></Label>
              <Input id="price" name="price" type="number" min={0} step={0.01} required placeholder="499" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" name="currency" defaultValue="INR" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="inventory">Quantity in stock <span className="text-destructive">*</span></Label>
              <Input id="inventory" name="inventory" type="number" min={0} step={1} required defaultValue={1} placeholder="50" />
              <p className="text-xs text-muted-foreground">
                A low-stock warning appears when quantity drops below 10.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount_pct">Discount %</Label>
              <Input
                id="discount_pct"
                name="discount_pct"
                type="number"
                min={0}
                max={100}
                step={1}
                defaultValue={0}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                0 = no discount. Enter 10 for a 10% off sale price.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Submit ── */}
      <Card>
        <CardHeader><CardTitle>Listing</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label className="block">Submit for admin review</Label>
              <p className="text-xs text-muted-foreground">
                Drafts are private. Submitted products are reviewed by our team before appearing in the shop.
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
