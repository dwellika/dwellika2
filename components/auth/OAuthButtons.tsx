"use client"

import { useTransition } from "react"

import { signInWithOAuth } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.5 12 2.5 6.7 2.5 2.5 6.7 2.5 12s4.2 9.5 9.5 9.5c5.5 0 9.1-3.8 9.1-9.3 0-.6-.1-1.1-.2-1.5H12z"
      />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.73-1.53-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.39.98 0 1.97.13 2.89.39 2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56C20.21 21.38 23.5 17.07 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
      <path d="M16.365 1.43c0 1.14-.43 2.27-1.29 3.11-.94.92-2.11 1.57-3.27 1.46-.13-1.07.42-2.22 1.18-3.02.86-.94 2.21-1.59 3.38-1.55zM21.5 17.4c-.7 1.61-1.49 3.17-2.95 3.2-1.42.03-1.88-.84-3.49-.84-1.6 0-2.12.81-3.46.86-1.41.06-2.49-1.74-3.21-3.34-1.47-3.27-2.6-9.24.62-13.16.96-1.17 2.68-1.91 4.5-1.95 1.4-.03 2.71.94 3.55.94.85 0 2.45-1.16 4.13-.99.7.03 2.66.28 3.92 2.13-3.27 1.79-2.74 6.27.39 7.71-.94 2.05-2.18 4.08-3 4.44z" />
    </svg>
  )
}

const PROVIDERS = [
  { id: "google", label: "Continue with Google", Icon: GoogleIcon },
  { id: "github", label: "Continue with GitHub", Icon: GitHubIcon },
  { id: "apple", label: "Continue with Apple", Icon: AppleIcon },
] as const

export function OAuthButtons({ next = "/" }: { next?: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <div className="grid gap-2">
      {PROVIDERS.map(({ id, label, Icon }) => (
        <form
          key={id}
          action={(fd) =>
            startTransition(async () => {
              fd.set("provider", id)
              fd.set("next", next)
              const result = await signInWithOAuth(fd)
              if (result && !result.ok) {
                console.error(result.error)
              }
            })
          }
        >
          <Button
            type="submit"
            variant="outline"
            disabled={pending}
            className="w-full justify-center gap-2"
          >
            <Icon />
            <span>{label}</span>
          </Button>
        </form>
      ))}
    </div>
  )
}
