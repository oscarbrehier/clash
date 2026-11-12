import { createMistral } from "@ai-sdk/mistral"
import type { ProviderDefinition } from "../provider-definition.ts"

export const mistralProvider: ProviderDefinition = {
  id: "mistral",
  displayName: "Mistral",
  create(env) {
    if (!env.MISTRAL_API_KEY) {
      return undefined
    }

    const provider = createMistral({ apiKey: env.MISTRAL_API_KEY })

    return (modelId) => provider(modelId)
  },
}
