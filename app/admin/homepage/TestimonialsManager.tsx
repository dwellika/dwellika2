"use client"

import { useState, useTransition } from "react"
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { createTestimonial, deleteTestimonial, toggleTestimonialFeatured } from "./actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

export interface TestimonialItem {
  id: string
  group_name: string
  author_name: string
  is_featured: boolean
}

const GROUPS = [
  { value: "artist", label: "Artist" },
  { value: "seller", label: "Seller" },
  { value: "buyer", label: "Buyer" },
]

export function TestimonialsManager({ items }: { items: TestimonialItem[] }) {
  const [group, setGroup] = useState("buyer")
  const [pending, startTransition] = useTransition()

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Add feedback from artists, sellers and buyers. Toggle “featured” to show it on the homepage.
      </p>

      {items.length > 0 && (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {items.map((t) => (
            <li key={t.id} className="flex items-center gap-2 p-3">
              <Badge variant="outline" className="capitalize">{t.group_name}</Badge>
              <span className="min-w-0 flex-1 truncate text-sm">{t.author_name}</span>
              {t.is_featured ? <Badge className="bg-emerald-500/20 text-emerald-300">On homepage</Badge> : <Badge variant="secondary">Hidden</Badge>}
              <Button
                size="icon" variant="ghost" className="size-8" disabled={pending}
                onClick={() => startTransition(async () => {
                  const r = await toggleTestimonialFeatured(t.id, !t.is_featured)
                  if (!r.ok) toast.error(r.error)
                })}
                aria-label="Toggle featured"
              >
                {t.is_featured ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
              <Button
                size="icon" variant="ghost" className="size-8 text-destructive" disabled={pending}
                onClick={() => startTransition(async () => {
                  const r = await deleteTestimonial(t.id)
                  if (!r.ok) toast.error(r.error)
                })}
                aria-label="Delete"
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form
        action={(fd) => startTransition(async () => {
          fd.set("group_name", group)
          const r = await createTestimonial(fd)
          if (r.ok) { toast.success("Testimonial added"); (document.getElementById("tst-form") as HTMLFormElement | null)?.reset() }
          else toast.error(r.error)
        })}
        id="tst-form"
        className="space-y-3 rounded-xl border border-dashed border-border p-4"
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_150px]">
          <div className="space-y-1.5">
            <Label htmlFor="tst-author">Author <span className="text-destructive">*</span></Label>
            <Input id="tst-author" name="author_name" required maxLength={120} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tst-role">Role label</Label>
            <Input id="tst-role" name="role_label" placeholder="Watercolorist, Jaipur" />
          </div>
          <div className="space-y-1.5">
            <Label>Group</Label>
            <Select value={group} onValueChange={setGroup}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {GROUPS.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Textarea name="body" rows={3} maxLength={600} required placeholder="The quote…" />
        <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
          <Input name="avatar_url" type="url" placeholder="Avatar URL (optional)" />
          <Input name="rating" type="number" min={1} max={5} placeholder="Rating 1-5" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_featured" defaultChecked className="size-4" /> Show on homepage
        </label>
        <Button type="submit" size="sm" disabled={pending}><Plus className="size-4" /> Add testimonial</Button>
      </form>
    </div>
  )
}
