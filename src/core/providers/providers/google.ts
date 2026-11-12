import { createGoogleGenerativeAI } from "@ai-sdk/google"
import type { ProviderDefinition } from "../provider-definition.ts"

export const googleProvider: ProviderDefinition = {
  id: "google",
  displayName: "Google",
  create(env) {
    if (!env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return undefined
    }

    const provider = createGoogleGenerativeAI({ apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY })

    return (modelId) => provider(modelId)
  },
}
