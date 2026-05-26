"use client"

import { useEffect, useState } from "react"

export interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  done: boolean
}

export function useCountdown(target: string | Date): Countdown {
  const targetMs = typeof target === "string" ? new Date(target).getTime() : target.getTime()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const diff = Math.max(0, targetMs - now)
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
    done: diff <= 0,
  }
}
