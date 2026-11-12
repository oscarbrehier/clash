import type { ChatInputCommandInteraction } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import { replyEphemeral } from "../../../core/discord/interaction-replies.ts"
import { resolveEditableChat } from "./resolve-editable-chat.ts"

export async function clearPersona(
  interaction: ChatInputCommandInteraction<"cached">,
  context: CoreContext,
) {
  const target = await resolveEditableChat(interaction, context)

  if (!target) {
    return
  }

  if (!target.thread.personaId && !target.thread.systemPrompt) {
    await replyEphemeral(interaction, "This chat already uses the default assistant.")
    return
  }

  context.sessions.threads.update(target.thread.threadId, { personaId: null, systemPrompt: null })

  await interaction.reply({
    content: `🎭 <@${interaction.user.id}> reset this chat to the default assistant.`,
  })
}
