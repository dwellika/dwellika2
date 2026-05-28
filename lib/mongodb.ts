// MongoDB — analytics/recommendation engine only.
// NEVER used for auth, users, or relational business data (that's PostgreSQL).
//
// Connection is LAZY: client.connect() is called only when getDb() is first
// invoked at request-time. No module-level connection means no TLS errors
// during Next.js static page generation or Vercel build.

import { MongoClient, type Db } from "mongodb"

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: Promise<MongoClient> | undefined
  // eslint-disable-next-line no-var
  var _mongoIndexesEnsured: boolean | undefined
}

const MONGO_OPTIONS = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
}

// Module-level promise cache for production Vercel warm instances.
// Cleared on connection failure so the next request retries cleanly.
let _prodClient: Promise<MongoClient> | null = null

function buildClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI
  if (!uri) return Promise.reject(new Error("MONGODB_URI not set"))

  // Development: reuse across hot-reloads via globalThis
  if (process.env.NODE_ENV === "development") {
    if (!globalThis._mongoClient) {
      const client = new MongoClient(uri, MONGO_OPTIONS)
      globalThis._mongoClient = client.connect().catch((err) => {
        globalThis._mongoClient = undefined
        throw err
      })
    }
    return globalThis._mongoClient
  }

  // Production: module-level singleton, cleared on failure for auto-retry
  if (!_prodClient) {
    const client = new MongoClient(uri, MONGO_OPTIONS)
    _prodClient = client.connect().catch((err) => {
      _prodClient = null // allow next request to retry
      throw err
    })
  }
  return _prodClient
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Returns the dwellika Db handle. Connects lazily on first call. */
export async function getDb(): Promise<Db> {
  const client = await buildClientPromise()
  const db = client.db("dwellika")
  ensureIndexes(db).catch(() => {}) // fire-and-forget, non-blocking
  return db
}

/** Graceful wrapper — analytics failures never break the app. */
export async function safeDb(): Promise<Db | null> {
  try {
    return await getDb()
  } catch {
    return null
  }
}

// ─── Index bootstrap (runs once per process) ─────────────────────────────────

async function ensureIndexes(db: Db): Promise<void> {
  if (globalThis._mongoIndexesEnsured) return
  globalThis._mongoIndexesEnsured = true

  try {
    await db.collection("reel_events").createIndexes([
      { key: { reel_id: 1, ts: -1 } },
      { key: { ts: -1 } },
      { key: { user_id: 1, ts: -1 } },
      { key: { event: 1, ts: -1 } },
    ])
    await db.collection("reel_scores").createIndexes([
      { key: { reel_id: 1 }, unique: true },
      { key: { score: -1 } },
      { key: { updated_at: -1 } },
    ])
    await db.collection("user_feed_state").createIndexes([
      { key: { user_id: 1 }, unique: true },
    ])
    await db.collection("user_interests").createIndexes([
      { key: { user_id: 1 }, unique: true },
    ])
    await db.collection("trending_cache").createIndexes([
      { key: { created_at: 1 }, expireAfterSeconds: 300 },
    ])
  } catch {
    // Index creation is non-fatal — resets the flag so next cold start retries
    globalThis._mongoIndexesEnsured = false
  }
}
