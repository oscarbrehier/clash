import type { LanguageModel } from "ai"
import type { ModelDefinition } from "../config/model-catalog.ts"
import type { ProviderRegistry } from "./provider-registry.ts"

export interface ModelRegistry {
  list(): ModelDefinition[]
  find(id: string): ModelDefinition | undefined
  get(id: string): ModelDefinition
  languageModel(model: ModelDefinition): LanguageModel
  defaultModel(): ModelDefinition
  titleModel(): ModelDefinition
}

interface ModelRegistryOptions {
  catalog: readonly ModelDefinition[]
  providers: ProviderRegistry
  defaultModelId: string
  titleModelId: string
}

export function createModelRegistry(options: ModelRegistryOptions): ModelRegistry {
  const available = options.catalog.filter((model) => options.providers.isEnabled(model.provider))
  const byId = new Map(available.map((model) => [model.id, model]))

  const get = (id: string) => {
    const model = byId.get(id)

    if (!model) {
      throw new Error(`Model "${id}" is not in the catalog or its provider is not enabled`)
    }

    return model
  }

  const defaultModel = get(options.defaultModelId)
  const titleModel = get(options.titleModelId)

  return {
    list: () => [...available],
    find: (id) => byId.get(id),
    get,
    languageModel: (model) =>
      options.providers.languageModel(model.provider, model.providerModelId),
    defaultModel: () => defaultModel,
    titleModel: () => titleModel,
  }
}
