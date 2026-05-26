// Dwellika service worker — minimal network-first cache with offline fallback.
// Bump CACHE_VERSION to invalidate all caches on deploy.

const CACHE_VERSION = "dwellika-v1"
const OFFLINE_URL = "/offline"
const PRECACHE = [OFFLINE_URL, "/manifest.json"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE)),
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_VERSION)
            .map((k) => caches.delete(k)),
        ),
      ),
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return
  if (!request.url.startsWith(self.location.origin)) return
  // Skip Next.js HMR / RSC requests
  if (request.url.includes("/_next/data/")) return
  if (request.headers.get("RSC")) return

  // Network-first for documents (HTML); fallback to offline page when offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_VERSION)
        return (await cache.match(OFFLINE_URL)) ?? Response.error()
      }),
    )
    return
  }

  // Cache-first for static assets — let the browser+CDN do the rest.
  if (
    request.destination === "image" ||
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font"
  ) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ??
          fetch(request).then((response) => {
            const copy = response.clone()
            if (response.ok) {
              caches.open(CACHE_VERSION).then((c) => c.put(request, copy))
            }
            return response
          }),
      ),
    )
  }
})
