import type { ProviderDefinition } from "../provider-definition.ts"
import { anthropicProvider } from "./anthropic.ts"
import { googleProvider } from "./google.ts"
import { mistralProvider } from "./mistral.ts"
import { ollamaProvider } from "./ollama.ts"
import { openaiProvider } from "./openai.ts"
import { openrouterProvider } from "./openrouter.ts"

export const providerDefinitions: readonly ProviderDefinition[] = [
  anthropicProvider,
  openaiProvider,
  googleProvider,
  mistralProvider,
  openrouterProvider,
  ollamaProvider,
]
