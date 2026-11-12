import type { ButtonInteraction } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import { canManageChat } from "../../../core/discord/can-manage-chat.ts"
import { replyEphemeral } from "../../../core/discord/interaction-replies.ts"
import type { ButtonHandler } from "../../../core/modules/component-handler.ts"
import { chatRuntime } from "../chat-runtime.ts"
import { chatThreadOf } from "./chat-thread-of.ts"
import { stopButtonId } from "./reply-controls.ts"

export const stopButton: ButtonHandler = {
  type: "button",
  id: stopButtonId,
  execute: stopGeneration,
}

async function stopGeneration(
  interaction: ButtonInteraction<"cached">,
  _args: string[],
  context: CoreContext,
) {
  const chat = chatThreadOf(interaction, context)
  const generation = chat ? chatRuntime().generations.find(chat.channel.id) : undefined

  if (!chat || !generation) {
    await replyEphemeral(interaction, "Nothing is being generated right now.")
    return
  }

  const isRequester = interaction.user.id === generation.requesterId

  if (!isRequester && !canManageChat(interaction.member, chat.channel, chat.thread.ownerId)) {
    await replyEphemeral(
      interaction,
      "Only the person who asked, or a moderator, can stop this reply.",
    )
    return
  }

  chatRuntime().generations.abort(chat.channel.id)
  await interaction.deferUpdate()
}
