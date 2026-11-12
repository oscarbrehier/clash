import type { CoreContext } from "../../core/context.ts"
import type { GenerationCompletedEvent } from "../../core/hooks/chat-hooks.ts"
import { estimateCost, tokenCountsOf } from "./estimate-cost.ts"
import { usageEvents } from "./schema.ts"

export function recordUsage(event: GenerationCompletedEvent, context: CoreContext) {
  const tokens = tokenCountsOf(event.usage)

  context.db
    .insert(usageEvents)
    .values({
      id: crypto.randomUUID(),
      guildId: event.guildId,
      threadId: event.threadId,
      userId: event.userId,
      modelId: event.model.id,
      purpose: event.purpose,
      inputTokens: tokens.input,
      cachedInputTokens: tokens.cachedInput,
      outputTokens: tokens.output,
      reasoningTokens: tokens.reasoning,
      costUsd: estimateCost(event.model.pricing, tokens),
    })
    .run()
}
