import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import type { ProviderDefinition } from "../provider-definition.ts"

export const ollamaProvider: ProviderDefinition = {
  id: "ollama",
  displayName: "Ollama",
  create(env) {
    if (!env.OLLAMA_BASE_URL) {
      return undefined
    }

    const provider = createOpenAICompatible({
      name: "ollama",
      baseURL: toOpenAiCompatibleUrl(env.OLLAMA_BASE_URL),
    })

    return (modelId) => provider.chatModel(modelId)
  },
}

function toOpenAiCompatibleUrl(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/+$/, "")

  return trimmed.endsWith("/v1") ? trimmed : `${trimmed}/v1`
}
