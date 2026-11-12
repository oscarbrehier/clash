import type { AnyThreadChannel, ButtonInteraction } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import type { ThreadRecord } from "../../../core/db/schema/threads.ts"

export interface ButtonChat {
  channel: AnyThreadChannel
  thread: ThreadRecord
}

export function chatThreadOf(
  interaction: ButtonInteraction<"cached">,
  context: CoreContext,
): ButtonChat | undefined {
  const channel = interaction.channel

  if (!channel?.isThread()) {
    return undefined
  }

  const thread = context.sessions.threads.find(channel.id)

  return thread ? { channel, thread } : undefined
}
