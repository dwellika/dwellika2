"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#FAF4E6" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#e11d48", marginBottom: "0.75rem" }}>
            Unexpected error
          </p>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700, margin: "0 0 0.75rem" }}>
            Something cracked in the glass.
          </h1>
          <p style={{ color: "#6b7280", maxWidth: "28rem", marginBottom: "1.5rem" }}>
            We&apos;ve been notified. The gallery is still here — try reloading the page.
          </p>
          {error.digest && (
            <p style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#9ca3af", marginBottom: "1.5rem" }}>
              ref: {error.digest}
            </p>
          )}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={() => reset()}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "0.5rem",
                background: "#e76b3c",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Try again
            </button>
            <button
              onClick={() => { window.location.href = "/" }}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "0.5rem",
                background: "transparent",
                color: "#374151",
                border: "1px solid #d1d5db",
                cursor: "pointer",
              }}
            >
              Back home
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
