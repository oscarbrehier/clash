import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import type { ProviderDefinition } from "../provider-definition.ts"

export const openrouterProvider: ProviderDefinition = {
  id: "openrouter",
  displayName: "OpenRouter",
  create(env) {
    if (!env.OPENROUTER_API_KEY) {
      return undefined
    }

    const provider = createOpenRouter({ apiKey: env.OPENROUTER_API_KEY })

    return (modelId) => provider(modelId)
  },
}
