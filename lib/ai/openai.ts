// Backward-compat shim — all logic lives in lib/ai/provider.ts
export {
  getChatClient as getOpenAI,
  isAIConfigured as isOpenAIConfigured,
  embedText,
  VISION_MODEL,
} from "./provider"
