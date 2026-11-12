import { isStepCount, streamText, type ToolSet } from "ai"
import type { ModelDefinition } from "../../../core/config/model-catalog.ts"
import type { CoreContext } from "../../../core/context.ts"
import type { GenerationPrompt } from "./build-prompt.ts"

const maxToolSteps = 5

const maxProviderRetries = 1

const streamTimeouts = {
  firstChunkMs: 120_000,
  chunkMs: 60_000,
  totalMs: 600_000,
}

export function startStream(
  context: CoreContext,
  model: ModelDefinition,
  prompt: GenerationPrompt,
  signal: AbortSignal,
) {
  const tools = toolsFor(context, model)
  const log = context.logger.child("chat:stream")

  return streamText({
    model: context.models.languageModel(model),
    instructions: prompt.instructions,
    messages: prompt.messages,
    maxOutputTokens: prompt.maxOutputTokens,
    abortSignal: signal,
    maxRetries: maxProviderRetries,
    timeout: streamTimeouts,
    ...(tools ? { tools, stopWhen: isStepCount(maxToolSteps) } : {}),
    onError: ({ error }) => log.debug("Stream reported an error", error),
  })
}

function toolsFor(context: CoreContext, model: ModelDefinition): ToolSet | undefined {
  const hasTools = Object.keys(context.tools).length > 0

  return model.tools && hasTools ? context.tools : undefined
}
