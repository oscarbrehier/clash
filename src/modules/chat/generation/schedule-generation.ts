import type { AnyThreadChannel } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import { chatRuntime } from "../chat-runtime.ts"
import { runGeneration } from "./run-generation.ts"

export function scheduleGeneration(
  context: CoreContext,
  channel: AnyThreadChannel,
  userId: string,
) {
  chatRuntime().scheduler.schedule(channel.id, () => runGeneration(context, { channel, userId }))
}
