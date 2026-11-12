import type {
  AnyThreadChannel,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
} from "discord.js"
import type { CoreContext } from "../context.ts"
import type { ThreadRecord } from "../db/schema/threads.ts"
import { replyEphemeral } from "./interaction-replies.ts"

export type ChatThreadInteraction =
  | ChatInputCommandInteraction<"cached">
  | ModalSubmitInteraction<"cached">

export interface ChatThreadTarget {
  channel: AnyThreadChannel
  thread: ThreadRecord
}

export async function resolveChatThread(
  interaction: ChatThreadInteraction,
  context: CoreContext,
): Promise<ChatThreadTarget | undefined> {
  const channel = interaction.channel

  if (!channel?.isThread()) {
    await replyEphemeral(interaction, "Use this command inside a chat thread.")
    return undefined
  }

  const thread = context.sessions.threads.find(channel.id)

  if (!thread) {
    await replyEphemeral(interaction, "This thread is not an AI chat.")
    return undefined
  }

  return { channel, thread }
}
