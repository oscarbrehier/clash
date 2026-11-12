import type { LanguageModelUsage } from "ai"
import type { ModelPricing } from "../../core/config/model-catalog.ts"

const tokensPerPricingUnit = 1_000_000

export interface TokenCounts {
  input: number
  cachedInput: number
  output: number
  reasoning: number
}

export function tokenCountsOf(usage: LanguageModelUsage): TokenCounts {
  return {
    input: usage.inputTokens ?? 0,
    cachedInput: usage.inputTokenDetails.cacheReadTokens ?? 0,
    output: usage.outputTokens ?? 0,
    reasoning: usage.outputTokenDetails.reasoningTokens ?? 0,
  }
}

export function estimateCost(
  pricing: ModelPricing | undefined,
  tokens: TokenCounts,
): number | null {
  if (!pricing) {
    return null
  }

  const cachedInput = Math.min(tokens.cachedInput, tokens.input)
  const uncachedInput = tokens.input - cachedInput
  const cachedPrice = pricing.cachedInputPerMillionTokens ?? pricing.inputPerMillionTokens

  const total =
    uncachedInput * pricing.inputPerMillionTokens +
    cachedInput * cachedPrice +
    tokens.output * pricing.outputPerMillionTokens

  return total / tokensPerPricingUnit
}
