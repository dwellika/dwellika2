import "server-only"

import OpenAI from "openai"

import {
  AI_PROVIDER_REGISTRY,
  ACTIVE_PROVIDER,
  EMBEDDING_MODEL,
} from "./config"

// ─── Lazy singletons ──────────────────────────────────────────────────────────

let _chatClient: OpenAI | null = null
let _embedClient: OpenAI | null = null

// Strip surrounding quotes and whitespace from env var values.
// Handles OPENAI_API_KEY="" (len=2 empty-quoted) written by .env templates.
function readKey(...names: string[]): string | undefined {
  for (const name of names) {
    const raw = process.env[name]?.trim().replace(/^["']|["']$/g, "").trim()
    if (raw) return raw
  }
  return undefined
}

/**
 * Returns an OpenAI-compatible client for the active chat/vision provider.
 * Groq and future providers are accessed via their OpenAI-compatible endpoint.
 */
export function getChatClient(): OpenAI | null {
  if (_chatClient) return _chatClient
  const cfg = AI_PROVIDER_REGISTRY[ACTIVE_PROVIDER]
  const key = readKey(cfg.apiKeyEnv)
  if (!key) return null
  _chatClient = new OpenAI({
    apiKey: key,
    ...(cfg.baseURL ? { baseURL: cfg.baseURL } : {}),
    timeout: 30_000,
    maxRetries: 1,
  })
  return _chatClient
}

/**
 * Returns an OpenAI client used exclusively for text embeddings.
 * Groq does not support embeddings — this always targets OpenAI's endpoint.
 * Set AI_EMBEDDING_KEY (preferred) or OPENAI_API_KEY (fallback).
 */
export function getEmbedClient(): OpenAI | null {
  if (_embedClient) return _embedClient
  const key = readKey("AI_EMBEDDING_KEY", "OPENAI_API_KEY")
  if (!key) return null
  _embedClient = new OpenAI({ apiKey: key, timeout: 15_000, maxRetries: 1 })
  return _embedClient
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** True when the active chat provider (Groq) is configured. */
export function isAIConfigured(): boolean {
  const cfg = AI_PROVIDER_REGISTRY[ACTIVE_PROVIDER]
  return Boolean(readKey(cfg.apiKeyEnv))
}

/** True when vector search / embedding (OpenAI) is available. */
export function isEmbeddingConfigured(): boolean {
  return Boolean(readKey("AI_EMBEDDING_KEY", "OPENAI_API_KEY"))
}

/** Model names resolved from the active provider. */
export const CHAT_MODEL = AI_PROVIDER_REGISTRY[ACTIVE_PROVIDER].chatModel
export const VISION_MODEL = AI_PROVIDER_REGISTRY[ACTIVE_PROVIDER].visionModel

/**
 * Embeds `input` into a float vector using the configured embedding provider.
 * Returns null gracefully if the provider is unconfigured or the call fails.
 */
export async function embedText(input: string): Promise<number[] | null> {
  const client = getEmbedClient()
  if (!client) return null
  const trimmed = input.trim().slice(0, 8_000)
  if (!trimmed) return null
  try {
    const res = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: trimmed,
    })
    return res.data[0]?.embedding ?? null
  } catch {
    return null
  }
}
