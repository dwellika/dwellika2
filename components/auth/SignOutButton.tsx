"use client"

import { useTransition } from "react"

import { signOutAction as signOut } from "@/app/(auth)/actions"
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
          await signOut()
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
