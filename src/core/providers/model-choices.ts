import type { ApplicationCommandOptionChoiceData } from "discord.js"
import type { ModelDefinition } from "../config/model-catalog.ts"
import type { ModelRegistry } from "./model-registry.ts"

const discordChoiceLimit = 25

export function modelChoices(
  models: ModelRegistry,
  query: string,
): ApplicationCommandOptionChoiceData<string>[] {
  const normalizedQuery = query.trim().toLowerCase()

  return models
    .list()
    .filter((model) => matchesQuery(model, normalizedQuery))
    .slice(0, discordChoiceLimit)
    .map((model) => ({ name: model.displayName, value: model.id }))
}

function matchesQuery(model: ModelDefinition, query: string): boolean {
  if (query.length === 0) {
    return true
  }

  return [model.id, model.displayName, model.provider].some((field) =>
    field.toLowerCase().includes(query),
  )
}
