import type { AnyThreadChannel, ButtonInteraction } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import type { MessageRecord } from "../../../core/db/schema/messages.ts"
import { canManageChat } from "../../../core/discord/can-manage-chat.ts"
import { replyEphemeral } from "../../../core/discord/interaction-replies.ts"
import type { ButtonHandler } from "../../../core/modules/component-handler.ts"
import { chatRuntime } from "../chat-runtime.ts"
import { scheduleGeneration } from "../generation/schedule-generation.ts"
import { chatThreadOf } from "./chat-thread-of.ts"
import { regenerateButtonId } from "./reply-controls.ts"

export const regenerateButton: ButtonHandler = {
  type: "button",
  id: regenerateButtonId,
  execute: regenerateReply,
}

async function regenerateReply(
  interaction: ButtonInteraction<"cached">,
  [replyId]: string[],
  context: CoreContext,
) {
  const chat = chatThreadOf(interaction, context)

  if (!chat) {
    await replyEphemeral(interaction, "This chat no longer exists.")
    return
  }

  if (!canManageChat(interaction.member, chat.channel, chat.thread.ownerId)) {
    await replyEphemeral(
      interaction,
      "Only the person who started this chat, or a moderator, can regenerate.",
    )
    return
  }

  if (chatRuntime().scheduler.isBusy(chat.channel.id)) {
    await replyEphemeral(interaction, "Wait until the current reply has finished.")
    return
  }

  const latest = context.sessions.messages.latestForThread(chat.channel.id)

  if (!latest || (latest.role === "assistant" && latest.id !== replyId)) {
    await replyEphemeral(interaction, "Only the latest reply can be regenerated.")
    return
  }

  await interaction.deferUpdate()
  await discardReply(context, chat.channel, latest, interaction)

  scheduleGeneration(context, chat.channel, interaction.user.id)
}

async function discardReply(
  context: CoreContext,
  channel: AnyThreadChannel,
  latest: MessageRecord,
  interaction: ButtonInteraction<"cached">,
) {
  if (latest.role === "user") {
    await interaction.message.delete().catch(() => undefined)
    return
  }

  context.sessions.messages.remove(latest.id)

  for (const messageId of latest.discordMessageIds) {
    await channel.messages.delete(messageId).catch(() => undefined)
  }
}
