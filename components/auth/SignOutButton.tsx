"use client"

import { useTransition } from "react"
import { signOut } from "next-auth/react"

import { Button } from "@/components/ui/button"

export function SignOutButton({
  className,
  variant = "ghost",
  children = "Sign out",
}: {
  className?: string
  variant?: "default" | "ghost" | "outline" | "destructive" | "secondary" | "link"
  children?: React.ReactNode
}) {
  const [pending, startTransition] = useTransition()

  return (
    <form
      action={() =>
        startTransition(async () => {
          // Client signOut clears the SessionProvider state and hard-navigates,
          // so the navbar reflects the signed-out state immediately.
          await signOut({ callbackUrl: "/" })
        })
      }
    >
      <Button
        type="submit"
        variant={variant}
        className={className}
        disabled={pending}
      >
        {pending ? "Signing out…" : children}
      </Button>
    </form>
  )
}
