"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"

import { Button } from "@/components/ui/button"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const DISMISSED_KEY = "dwellika.install.dismissed"

export function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.localStorage.getItem(DISMISSED_KEY)) {
      setHidden(true)
      return
    }
    const handler = (e: Event) => {
      e.preventDefault()
      setEvent(e as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  if (!event || hidden) return null

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm rounded-2xl border border-border bg-card p-4 shadow-2xl">
      <div className="flex items-start gap-3">
        <div className="grid size-10 place-items-center rounded-md bg-primary/15 text-primary">
          <Download className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Install Dwellika</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Add Dwellika to your home screen for an app-like experience and
            offline access to your saved pieces.
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              onClick={async () => {
                await event.prompt()
                const choice = await event.userChoice
                if (choice.outcome === "dismissed") {
                  window.localStorage.setItem(DISMISSED_KEY, "1")
                }
                setHidden(true)
                setEvent(null)
              }}
            >
              Install
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                window.localStorage.setItem(DISMISSED_KEY, "1")
                setHidden(true)
              }}
            >
              Not now
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            window.localStorage.setItem(DISMISSED_KEY, "1")
            setHidden(true)
          }}
          aria-label="Dismiss"
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
