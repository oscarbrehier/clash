import type { ApplicationCommandOptionChoiceData } from "discord.js"
import { z } from "zod"
import { personas as configuredPersonas } from "../../../config/personas.ts"
import { type Persona, personaSchema } from "./persona-definition.ts"

const discordChoiceLimit = 25

const discordChoiceNameLimit = 100

const catalogSchema = z
  .array(personaSchema)
  .min(1)
  .refine((list) => new Set(list.map((persona) => persona.id)).size === list.length, {
    message: "persona ids must be unique",
  })

const catalog = parseCatalog(configuredPersonas)

export function listPersonas(): readonly Persona[] {
  return catalog
}

export function findPersona(id: string): Persona | undefined {
  return catalog.find((persona) => persona.id === id)
}

export function personaLabel(persona: Persona): string {
  return `${persona.emoji} ${persona.name}`
}

export function personaChoices(query: string): ApplicationCommandOptionChoiceData<string>[] {
  const normalized = query.trim().toLowerCase()

  return catalog
    .filter((persona) => matches(persona, normalized))
    .slice(0, discordChoiceLimit)
    .map((persona) => ({
      name: `${personaLabel(persona)} — ${persona.description}`.slice(0, discordChoiceNameLimit),
      value: persona.id,
    }))
}

function matches(persona: Persona, query: string): boolean {
  if (query.length === 0) {
    return true
  }

  return [persona.id, persona.name, persona.description].some((field) =>
    field.toLowerCase().includes(query),
  )
}

function parseCatalog(list: unknown): Persona[] {
  const result = catalogSchema.safeParse(list)

  if (result.success) {
    return result.data
  }

  const problems = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`)

  throw new Error(
    `Invalid persona catalog:\n${problems.map((problem) => `  - ${problem}`).join("\n")}`,
  )
}
