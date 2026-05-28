import "server-only"

// ─── Provider registry ────────────────────────────────────────────────────────
// Add new providers here. The rest of the app never references provider names directly.

export type AIProvider = "groq" | "openai" | "anthropic" | "gemini"

interface ProviderConfig {
  /** OpenAI-compatible base URL. Undefined = OpenAI default. */
  baseURL?: string
  /** Name of the environment variable holding the API key. */
  apiKeyEnv: string
  /** Fast chat model for text-only tasks. */
  chatModel: string
  /** Vision-capable model for image analysis. */
  visionModel: string
  /** Whether this provider supports the embeddings endpoint. */
  supportsEmbeddings: boolean
  /** Embedding model name (if supportsEmbeddings is true). */
  embeddingModel?: string
}

export const AI_PROVIDER_REGISTRY: Record<AIProvider, ProviderConfig> = {
  groq: {
    baseURL: "https://api.groq.com/openai/v1",
    apiKeyEnv: "GROQ_API_KEY",
    chatModel: "llama-3.1-8b-instant",
    visionModel: "llama-3.2-11b-vision-preview",
    supportsEmbeddings: false, // Groq does not offer an embeddings endpoint
  },
  openai: {
    apiKeyEnv: "OPENAI_API_KEY",
    chatModel: "gpt-4o-mini",
    visionModel: "gpt-4o-mini",
    supportsEmbeddings: true,
    embeddingModel: "text-embedding-3-small",
  },
  anthropic: {
    apiKeyEnv: "ANTHROPIC_API_KEY",
    chatModel: "claude-haiku-4-5-20251001",
    visionModel: "claude-haiku-4-5-20251001",
    supportsEmbeddings: false,
  },
  gemini: {
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    apiKeyEnv: "GEMINI_API_KEY",
    chatModel: "gemini-1.5-flash",
    visionModel: "gemini-1.5-flash",
    supportsEmbeddings: false,
  },
}

// ─── Active provider ──────────────────────────────────────────────────────────
// Set AI_PROVIDER env var to switch providers. Defaults to groq.

export const ACTIVE_PROVIDER: AIProvider =
  (process.env.AI_PROVIDER as AIProvider | undefined) ?? "groq"

// ─── Embedding config ─────────────────────────────────────────────────────────
// Embeddings (vector search) need a dedicated endpoint. Groq doesn't support this.
// Set AI_EMBEDDING_KEY to an OpenAI-compatible key. Falls back to OPENAI_API_KEY.
// Leave unset to disable vector search (keyword fallback is used instead).

export const EMBEDDING_MODEL = "text-embedding-3-small"
