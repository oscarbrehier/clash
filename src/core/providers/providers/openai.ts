import { createOpenAI } from "@ai-sdk/openai"
import type { ProviderDefinition } from "../provider-definition.ts"

export const openaiProvider: ProviderDefinition = {
  id: "openai",
  displayName: "OpenAI",
  create(env) {
    if (!env.OPENAI_API_KEY) {
      return undefined
    }

    const provider = createOpenAI({ apiKey: env.OPENAI_API_KEY })

    return (modelId) => provider(modelId)
  },
}
