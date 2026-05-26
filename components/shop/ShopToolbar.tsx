"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { Filter, Search, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"

interface ShopToolbarProps {
  searchPlaceholder?: string
  sortOptions: Array<{ value: string; label: string }>
  filters?: Array<{ id: string; label: string; options: string[] }>
  priceRange?: { min: number; max: number }
}

export function ShopToolbar({
  searchPlaceholder = "Search…",
  sortOptions,
  filters = [],
  priceRange,
}: ShopToolbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  const currentSort = params.get("sort") ?? sortOptions[0]?.value
  const currentQ = params.get("q") ?? ""

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString())
    if (value && value.length > 0) next.set(key, value)
    else next.delete(key)
    startTransition(() => router.push(`${pathname}?${next.toString()}`))
  }

  return (
    <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center">
      <form
        action={(fd) => setParam("q", String(fd.get("q") ?? ""))}
        className="relative flex-1"
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={currentQ}
          placeholder={searchPlaceholder}
          className="pl-9"
        />
      </form>

      <div className="flex items-center gap-2">
        <Select
          value={currentSort}
          onValueChange={(v) => setParam("sort", v)}
        >
          <SelectTrigger className="w-44">
            <SlidersHorizontal className="mr-1 size-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(filters.length > 0 || priceRange) && (
          <FilterSheet
            filters={filters}
            priceRange={priceRange}
            params={params}
            onApply={(updates) => {
              const next = new URLSearchParams(params.toString())
              for (const [k, v] of Object.entries(updates)) {
                if (v == null || v === "") next.delete(k)
                else next.set(k, v)
              }
              startTransition(() => router.push(`${pathname}?${next.toString()}`))
            }}
            pending={pending}
          />
        )}
      </div>
    </div>
  )
}

function FilterSheet({
  filters,
  priceRange,
  params,
  onApply,
  pending,
}: {
  filters: ShopToolbarProps["filters"]
  priceRange?: { min: number; max: number }
  params: URLSearchParams
  onApply: (updates: Record<string, string | null>) => void
  pending: boolean
}) {
  const [open, setOpen] = useState(false)
  const initialMin = Number(params.get("minPrice") ?? priceRange?.min ?? 0)
  const initialMax = Number(params.get("maxPrice") ?? priceRange?.max ?? 50000)
  const [price, setPrice] = useState<[number, number]>([initialMin, initialMax])
  const [picked, setPicked] = useState<Record<string, string | null>>(
    Object.fromEntries(
      (filters ?? []).map((f) => [f.id, params.get(f.id)]),
    ),
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Filter className="size-4" /> Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {(filters ?? []).map((f) => (
            <div key={f.id} className="space-y-2">
              <Label>{f.label}</Label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setPicked((p) => ({ ...p, [f.id]: null }))}
                  className={
                    picked[f.id] == null
                      ? "rounded-full border border-primary bg-primary/15 px-3 py-1 text-xs text-primary"
                      : "rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground"
                  }
                >
                  All
                </button>
                {f.options.map((opt) => {
                  const active = picked[f.id] === opt
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPicked((p) => ({ ...p, [f.id]: active ? null : opt }))}
                      className={
                        active
                          ? "rounded-full border border-primary bg-primary/15 px-3 py-1 text-xs text-primary"
                          : "rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                      }
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {priceRange ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Price range</Label>
                <span className="text-xs tabular-nums text-muted-foreground">
                  ₹{price[0].toLocaleString()} – ₹{price[1].toLocaleString()}
                </span>
              </div>
              <Slider
                value={price}
                min={priceRange.min}
                max={priceRange.max}
                step={500}
                onValueChange={(v) => setPrice([v[0], v[1]] as [number, number])}
              />
            </div>
          ) : null}

          <div className="flex gap-2">
            <Button
              className="flex-1"
              disabled={pending}
              onClick={() => {
                onApply({
                  ...picked,
                  minPrice: priceRange ? String(price[0]) : null,
                  maxPrice: priceRange ? String(price[1]) : null,
                })
                setOpen(false)
              }}
            >
              Apply
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const cleared = Object.fromEntries(
                  Object.keys(picked).map((k) => [k, null]),
                )
                setPicked(cleared)
                if (priceRange) setPrice([priceRange.min, priceRange.max])
                onApply({ ...cleared, minPrice: null, maxPrice: null })
                setOpen(false)
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
