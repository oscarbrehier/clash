import type { LanguageModel } from "ai"
import type { Env } from "../config/env.ts"
import type { ProviderId } from "../config/model-catalog.ts"

export type ModelFactory = (providerModelId: string) => LanguageModel

export interface ProviderDefinition {
  id: ProviderId
  displayName: string
  create(env: Env): ModelFactory | undefined
}
