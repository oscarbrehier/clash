import type { ModelDefinition } from "../config/model-catalog.ts"
import type { CoreContext } from "../context.ts"
import type { ThreadRecord } from "../db/schema/threads.ts"

type ModelLookupContext = Pick<CoreContext, "models" | "sessions">

export function resolveGuildDefaultModel(
  context: ModelLookupContext,
  guildId: string,
): ModelDefinition {
  const guildDefaultId = context.sessions.guilds.find(guildId)?.defaultModelId
  const guildDefault = guildDefaultId ? context.models.find(guildDefaultId) : undefined

  return guildDefault ?? context.models.defaultModel()
}

export function resolveThreadModel(
  context: ModelLookupContext,
  thread: ThreadRecord,
): ModelDefinition {
  const threadModel = thread.modelId ? context.models.find(thread.modelId) : undefined

  return threadModel ?? resolveGuildDefaultModel(context, thread.guildId)
}
