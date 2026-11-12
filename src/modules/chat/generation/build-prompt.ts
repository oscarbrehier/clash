import type { ModelMessage } from "ai"
import type { ModelDefinition } from "../../../core/config/model-catalog.ts"
import type { CoreContext } from "../../../core/context.ts"
import type { ThreadRecord } from "../../../core/db/schema/threads.ts"
import { composeInstructions, defaultPersona } from "./system-prompt.ts"
import { toModelMessage } from "./to-model-message.ts"
import { estimateTokens, trimToWindow } from "./trim-to-window.ts"

const contextSafetyMarginTokens = 1_000

export interface GenerationPrompt {
  instructions: string
  messages: ModelMessage[]
  maxOutputTokens: number
}

export async function buildPrompt(
  context: CoreContext,
  thread: ThreadRecord,
  model: ModelDefinition,
): Promise<GenerationPrompt> {
  const instructions = await resolveInstructions(context, thread, model)
  const maxOutputTokens = Math.min(
    thread.settings.maxOutputTokens ?? model.maxOutputTokens,
    model.maxOutputTokens,
  )

  const budget =
    model.contextWindow - maxOutputTokens - estimateTokens(instructions) - contextSafetyMarginTokens

  return {
    instructions,
    messages: trimToWindow(loadHistory(context, thread, model), budget),
    maxOutputTokens,
  }
}

function loadHistory(
  context: CoreContext,
  thread: ThreadRecord,
  model: ModelDefinition,
): ModelMessage[] {
  const records = context.sessions.messages.listForThread(thread.threadId)
  const images = context.sessions.messages.imagesFor(records.map((record) => record.id))

  return records
    .filter((record) => record.content.trim().length > 0 || images.has(record.id))
    .map((record) => toModelMessage(record, images.get(record.id) ?? [], model))
}

async function resolveInstructions(
  context: CoreContext,
  thread: ThreadRecord,
  model: ModelDefinition,
): Promise<string> {
  const fromHooks = await context.hooks.resolveSystemPrompt({ thread, model })
  const persona = fromHooks ?? thread.systemPrompt ?? defaultPersona(model)

  return composeInstructions(persona)
}
