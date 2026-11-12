import { type ChatInputCommandInteraction, MessageFlags } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import { starterMessage } from "../discord/starter-message.ts"
import { threadNameFrom } from "../discord/thread-name.ts"
import { beginChat } from "../sessions/begin-chat.ts"
import { createChatThread } from "./create-chat-thread.ts"

const noPlaceMessage =
  "I can't start a chat here. Use this in a normal text channel, or set CHAT_FORUM_CHANNEL_ID to a forum."

export async function startNewChat(
  interaction: ChatInputCommandInteraction<"cached">,
  context: CoreContext,
) {
  const prompt = interaction.options.getString("prompt")?.trim() || undefined
  const modelId = interaction.options.getString("model") ?? undefined

  if (modelId && !context.models.find(modelId)) {
    await interaction.reply({
      content: `Unknown model \`${modelId}\`.`,
      flags: MessageFlags.Ephemeral,
    })
    return
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral })

  const channel = await createChatThread(context, interaction, {
    name: threadNameFrom(prompt),
    starter: starterMessage(interaction.user.id, prompt),
  })

  if (!channel) {
    await interaction.editReply({ content: noPlaceMessage })
    return
  }

  await interaction.editReply({ content: `Started a new chat: ${channel.url}` })

  await beginChat(context, {
    channel,
    ownerId: interaction.user.id,
    prompt,
    message: undefined,
    modelId,
  })
}
