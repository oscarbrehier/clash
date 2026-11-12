import type { LanguageModelUsage, TextStreamPart, ToolSet } from "ai"
import { GenerationTimeoutError } from "../errors/generation-timeout-error.ts"
import type { StreamRenderer } from "../rendering/stream-renderer.ts"

export interface StreamOutcome {
  text: string
  usage: LanguageModelUsage | undefined
  error: unknown
  aborted: boolean
}

export async function consumeStream(
  stream: AsyncIterable<TextStreamPart<ToolSet>>,
  renderer: StreamRenderer,
  signal: AbortSignal,
): Promise<StreamOutcome> {
  const outcome: StreamOutcome = { text: "", usage: undefined, error: undefined, aborted: false }

  try {
    for await (const part of stream) {
      applyPart(part, outcome, renderer, signal)
    }
  } catch (error) {
    recordInterruption(outcome, signal, error)
  }

  return outcome
}

function applyPart(
  part: TextStreamPart<ToolSet>,
  outcome: StreamOutcome,
  renderer: StreamRenderer,
  signal: AbortSignal,
) {
  switch (part.type) {
    case "text-delta":
      outcome.text += part.text
      renderer.append(part.text)
      return

    case "tool-call":
      renderer.setStatus(`🔧 Using ${part.toolName}…`)
      return

    case "tool-result":
    case "tool-error":
      renderer.setStatus(undefined)
      return

    case "error":
      outcome.error = part.error
      return

    case "abort":
      recordInterruption(outcome, signal, new GenerationTimeoutError())
      return

    case "finish":
      outcome.usage = part.totalUsage
      return
  }
}

function recordInterruption(outcome: StreamOutcome, signal: AbortSignal, error: unknown) {
  if (signal.aborted) {
    outcome.aborted = true
    return
  }

  outcome.error ??= error
}
