"use client"

import { useState, useTransition } from "react"
import { ArrowRight, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    startTransition(async () => {
      setError(null)
      try {
        const res = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email }),
        })
        const json = await res.json()
        if (!res.ok || !json.ok) throw new Error(json.error ?? "Something went wrong.")
        setDone(true)
        setEmail("")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.")
      }
    })
  }

  if (done) {
    return (
      <p className="text-sm text-muted-foreground">
        You&apos;re in. Watch your inbox for the next dispatch.
      </p>
    )
  }

  return (
    <form onSubmit={submit} className="flex max-w-md gap-2" noValidate>
      <div className="relative flex-1">
        <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@studio.art"
          className="pl-9"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : (
          <>
            Subscribe <ArrowRight className="size-3.5" />
          </>
        )}
      </Button>
      {error ? (
        <p className="basis-full text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  )
}
