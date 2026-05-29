"use client"

import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"

import { OfflineDetector } from "@/components/providers/OfflineDetector"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <OfflineDetector />
    </SessionProvider>
  )
}
