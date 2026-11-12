import type { AnyThreadChannel } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import type { ThreadRecord } from "../../../core/db/schema/threads.ts"
import {
  resolveGuildDefaultModel,
  resolveThreadModel,
} from "../../../core/sessions/resolve-thread-model.ts"

export interface SessionSeed {
  ownerId: string
  modelId?: string
}

export async function ensureSession(
  context: CoreContext,
  channel: AnyThreadChannel,
  seed: SessionSeed,
): Promise<ThreadRecord> {
  const existing = context.sessions.threads.find(channel.id)

  if (existing) {
    return existing
  }

  const thread = context.sessions.threads.create({
    threadId: channel.id,
    guildId: channel.guildId,
    ownerId: seed.ownerId,
    modelId: seed.modelId ?? resolveGuildDefaultModel(context, channel.guildId).id,
  })

  await context.hooks.emitSessionStarted({
    thread,
    channel,
    model: resolveThreadModel(context, thread),
  })

  return thread
}
