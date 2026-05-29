import { Search } from "lucide-react"

interface CommandTriggerProps {
  onOpen: () => void
}

export function CommandTrigger({ onOpen }: CommandTriggerProps) {
  return (
    <button
      onClick={onOpen}
      type="button"
      className="hidden h-9 w-full max-w-xs items-center gap-2 rounded-full border border-border bg-muted/30 px-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/50 md:inline-flex"
    >
      <Search className="size-4" />
      <span>Search Dwellika…</span>
      <kbd className="ml-auto rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
        ⌘K
      </kbd>
    </button>
  )
}
