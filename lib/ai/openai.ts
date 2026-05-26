import "server-only"

import OpenAI from "openai"

let cached: OpenAI | null = null

export function getOpenAI(): OpenAI | null {
  if (cached) return cached
  const key = process.env.OPENAI_API_KEY
  if (!key) return null
  cached = new OpenAI({ apiKey: key })
  return cached
}

export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY)
}

export const EMBEDDING_MODEL = "text-embedding-3-small"
export const VISION_MODEL = "gpt-4o-mini"

export async function embedText(input: string): Promise<number[] | null> {
  const client = getOpenAI()
  if (!client) return null
  const trimmed = input.trim().slice(0, 8000)
  if (!trimmed) return null
  const res = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: trimmed,
  })
  return res.data[0]?.embedding ?? null
}
