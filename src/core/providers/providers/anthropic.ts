import { createAnthropic } from "@ai-sdk/anthropic"
import type { ProviderDefinition } from "../provider-definition.ts"

export const anthropicProvider: ProviderDefinition = {
  id: "anthropic",
  displayName: "Anthropic",
  create(env) {
    if (!env.ANTHROPIC_API_KEY) {
      return undefined
    }

    const provider = createAnthropic({ apiKey: env.ANTHROPIC_API_KEY })

    return (modelId) => provider(modelId)
  },
}
