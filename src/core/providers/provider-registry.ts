import type { LanguageModel } from "ai"
import type { Env } from "../config/env.ts"
import type { ProviderId } from "../config/model-catalog.ts"
import type { ModelFactory, ProviderDefinition } from "./provider-definition.ts"

export interface ProviderRegistry {
  isEnabled(id: ProviderId): boolean
  enabledProviders(): ProviderDefinition[]
  displayNameOf(id: ProviderId): string
  languageModel(provider: ProviderId, providerModelId: string): LanguageModel
}

export function createProviderRegistry(
  env: Env,
  definitions: readonly ProviderDefinition[],
): ProviderRegistry {
  const factories = new Map<ProviderId, ModelFactory>()

  for (const definition of definitions) {
    const factory = definition.create(env)

    if (factory) {
      factories.set(definition.id, factory)
    }
  }

  return {
    isEnabled: (id) => factories.has(id),

    enabledProviders: () => definitions.filter((definition) => factories.has(definition.id)),

    displayNameOf: (id) =>
      definitions.find((definition) => definition.id === id)?.displayName ?? id,

    languageModel(provider, providerModelId) {
      const factory = factories.get(provider)

      if (!factory) {
        throw new Error(`Provider "${provider}" is not enabled`)
      }

      return factory(providerModelId)
    },
  }
}
