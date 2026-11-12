import { z } from "zod"

export const providerIds = ["anthropic", "openai", "google", "openrouter", "ollama"] as const

export type ProviderId = (typeof providerIds)[number]

const discordTagNameLimit = 20

const pricingSchema = z.object({
  inputPerMillionTokens: z.number().nonnegative(),
  outputPerMillionTokens: z.number().nonnegative(),
  cachedInputPerMillionTokens: z.number().nonnegative().optional(),
})

const modelDefinitionSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-.]*$/, "use lowercase letters, digits, dots and dashes"),
  displayName: z.string().min(1).max(100),
  provider: z.enum(providerIds),
  providerModelId: z.string().min(1),
  tagName: z.string().min(1).max(discordTagNameLimit),
  contextWindow: z.number().int().positive(),
  maxOutputTokens: z.number().int().positive(),
  vision: z.boolean(),
  tools: z.boolean(),
  pricing: pricingSchema.optional(),
})

export type ModelDefinition = z.infer<typeof modelDefinitionSchema>

export type ModelPricing = z.infer<typeof pricingSchema>

const catalogSchema = z
  .array(modelDefinitionSchema)
  .min(1)
  .superRefine((models, context) => {
    reportDuplicates(models, "id", context)
    reportDuplicates(models, "tagName", context)
  })

export function defineModels(models: ModelDefinition[]): ModelDefinition[] {
  return models
}

export function validateModelCatalog(models: unknown): ModelDefinition[] {
  const result = catalogSchema.safeParse(models)

  if (result.success) {
    return result.data
  }

  const problems = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`)

  throw new Error(
    `Invalid model catalog:\n${problems.map((problem) => `  - ${problem}`).join("\n")}`,
  )
}

function reportDuplicates(
  models: ModelDefinition[],
  key: "id" | "tagName",
  context: z.RefinementCtx,
) {
  const seen = new Set<string>()

  for (const model of models) {
    const value = model[key]

    if (seen.has(value)) {
      context.addIssue({ code: "custom", message: `duplicate ${key} "${value}"` })
    }

    seen.add(value)
  }
}
