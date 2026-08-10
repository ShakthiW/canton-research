import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

export interface GeminiModelOptions {
  modelName?: string
  temperature?: number
  maxTokens?: number
}

/**
 * Returns a configured LangChain ChatGoogleGenerativeAI instance using Gemini.
 * Default model: gemini-2.5-flash
 */
export function getGeminiModel(options?: GeminiModelOptions): ChatGoogleGenerativeAI {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.warn('WARNING: GOOGLE_API_KEY environment variable is missing!')
  }

  // Model on user's API endpoint is gemini-2.5-flash
  const modelName = options?.modelName || process.env.GEMINI_MODEL || 'gemini-2.5-flash'

  return new ChatGoogleGenerativeAI({
    apiKey,
    model: modelName,
    temperature: options?.temperature ?? 0.2, // Low temperature for factual extraction
    maxOutputTokens: options?.maxTokens || 4096,
  })
}

/**
 * Higher reasoning model instance using gemini-2.5-flash for report synthesis and red-teaming.
 */
export function getGeminiProModel(options?: GeminiModelOptions): ChatGoogleGenerativeAI {
  return getGeminiModel({
    modelName: options?.modelName || process.env.GEMINI_PRO_MODEL || 'gemini-2.5-flash',
    temperature: options?.temperature ?? 0.3,
    maxTokens: options?.maxTokens || 4096,
  })
}
