"use client"

import { useEffect, useState } from "react"
import { CloudOff, RefreshCw, Wifi } from "lucide-react"

export function OfflineDetector() {
  const [isOnline, setIsOnline] = useState(true)
  const [showBackOnline, setShowBackOnline] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    function handleOffline() {
      setIsOnline(false)
      setShowBackOnline(false)
    }

    function handleOnline() {
      setIsOnline(true)
      setShowBackOnline(true)
      setTimeout(() => setShowBackOnline(false), 3000)
    }

    window.addEventListener("offline", handleOffline)
    window.addEventListener("online", handleOnline)
    return () => {
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("online", handleOnline)
    }
  }, [])

  if (isOnline && !showBackOnline) return null

  return (
    <div
      className="fixed bottom-4 left-1/2 z-[200] -translate-x-1/2 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg transition-all duration-300"
      style={{
        background: isOnline ? "#22c55e" : "#ef4444",
        color: "#fff",
        minWidth: "180px",
        justifyContent: "center",
      }}
      role="status"
      aria-live="polite"
    >
      {isOnline ? (
        <>
          <Wifi className="size-4 shrink-0" />
          <span>Back online</span>
        </>
      ) : (
        <>
          <CloudOff className="size-4 shrink-0" />
          <span>No connection</span>
          <button
            type="button"
            className="ml-1 rounded-full p-0.5 opacity-80 hover:opacity-100 transition"
            onClick={() => window.location.reload()}
            aria-label="Retry"
          >
            <RefreshCw className="size-3.5" />
          </button>
        </>
      )}
    </div>
  )
}
