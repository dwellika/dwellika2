"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
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
  const [, startTransition] = useTransition()

  const currentSort = params.get("sort") ?? sortOptions[0]?.value
  const currentQ = params.get("q") ?? ""

  // Clears the page param so filter changes always land on page 1.
  const navigate = (next: URLSearchParams) => {
    next.delete("page")
    startTransition(() => router.push(`${pathname}?${next.toString()}`))
  }

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString())
    if (value && value.length > 0) next.set(key, value)
    else next.delete(key)
    navigate(next)
  }

  // Key for FilterSheet: changes whenever active filter/price params change,
  // forcing a remount so the sheet re-reads fresh values from the URL.
  const filterKey = [
    ...(filters ?? []).map((f) => params.get(f.id) ?? ""),
    params.get("minPrice") ?? "",
    params.get("maxPrice") ?? "",
  ].join("|")

  return (
    <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center">
      {/*
       * key={currentQ} remounts the form (and its uncontrolled Input) whenever
       * the URL's `q` changes so the input reflects the current search text.
       */}
      <form
        key={currentQ}
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
            key={filterKey}
            filters={filters}
            priceRange={priceRange}
            params={params}
            onApply={(updates) => {
              const next = new URLSearchParams(params.toString())
              for (const [k, v] of Object.entries(updates)) {
                if (v == null || v === "") next.delete(k)
                else next.set(k, v)
              }
              navigate(next)
            }}
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
}: {
  filters: ShopToolbarProps["filters"]
  priceRange?: { min: number; max: number }
  params: URLSearchParams
  onApply: (updates: Record<string, string | null>) => void
}) {
  const [open, setOpen] = useState(false)

  // Derive initial values from params (the component remounts via `key` when
  // filter params change, so useState is always initialised from fresh params).
  const [price, setPrice] = useState<[number, number]>([
    Number(params.get("minPrice") ?? priceRange?.min ?? 0),
    Number(params.get("maxPrice") ?? priceRange?.max ?? 50000),
  ])
  const [picked, setPicked] = useState<Record<string, string | null>>(
    Object.fromEntries(
      (filters ?? []).map((f) => [f.id, params.get(f.id)]),
    ),
  )

  // Safety net: if params change while the sheet is open, re-sync.
  useEffect(() => {
    setPicked(Object.fromEntries(
      (filters ?? []).map((f) => [f.id, params.get(f.id)]),
    ))
    if (priceRange) {
      setPrice([
        Number(params.get("minPrice") ?? priceRange.min),
        Number(params.get("maxPrice") ?? priceRange.max),
      ])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()])

  // Count active non-default filters for badge
  const activeCount =
    (filters ?? []).filter((f) => params.get(f.id)).length +
    (params.get("minPrice") ? 1 : 0) +
    (params.get("maxPrice") ? 1 : 0)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="size-4" /> Filters
          {activeCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {activeCount}
            </span>
          )}
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
                      : "rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
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
