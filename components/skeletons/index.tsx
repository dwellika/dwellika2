import { Skeleton } from "@/components/ui/skeleton"

// ─── Shared ───────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Skeleton className="aspect-[4/5] w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

function ArtistCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Skeleton className="h-28 w-full" />
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-3 w-full mt-2" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  )
}

// ─── Page Skeletons ───────────────────────────────────────────────────────────

export function HomeSkeleton() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      {/* Section */}
      <div className="container-page space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-64" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Artists rail */}
      <div className="container-page space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-9 w-56" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ArtistCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function DiscoverSkeleton() {
  return (
    <div className="container-page py-12 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export function ReelsSkeleton() {
  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center md:static md:h-[calc(100dvh-4rem)]">
      <div className="relative h-full w-full max-w-[430px] bg-neutral-900 flex flex-col">
        <Skeleton className="absolute inset-0 rounded-none bg-neutral-800" />

        {/* Right side action buttons */}
        <div className="absolute bottom-32 right-3 flex flex-col items-center gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="size-11 rounded-full bg-white/10" />
          ))}
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 inset-x-0 px-4 pb-8 space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full bg-white/10" />
            <Skeleton className="h-4 w-32 bg-white/10" />
          </div>
          <Skeleton className="h-3 w-full bg-white/10" />
          <Skeleton className="h-3 w-4/5 bg-white/10" />
        </div>
      </div>
    </div>
  )
}

export function ArtistsSkeleton() {
  return (
    <div className="container-page py-12 space-y-10">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Search + pills */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-xl rounded-lg" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 shrink-0 rounded-full" />
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ArtistCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export function CommunitiesSkeleton() {
  return (
    <div className="container-page py-12 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-xl rounded-lg" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 shrink-0 rounded-full" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
            <Skeleton className="h-32 w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Cover */}
      <Skeleton className="h-48 w-full rounded-none md:rounded-2xl" />

      <div className="container-page space-y-6">
        {/* Avatar + name */}
        <div className="flex items-end gap-4 -mt-16">
          <Skeleton className="size-24 rounded-full ring-4 ring-background" />
          <div className="flex-1 pb-2 space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2 max-w-2xl">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Stats */}
        <div className="flex gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>

        {/* Artwork grid */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function ShopSkeleton() {
  return (
    <div className="container-page py-12 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-12 w-40" />
      </div>

      <div className="flex gap-4">
        {/* Filters sidebar */}
        <div className="hidden md:block w-56 shrink-0 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="space-y-1.5 pl-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-3 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Product grid */}
        <div className="flex-1 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function ArtworkSkeleton() {
  return (
    <div className="container-page py-12">
      <div className="grid gap-8 md:grid-cols-2">
        <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
