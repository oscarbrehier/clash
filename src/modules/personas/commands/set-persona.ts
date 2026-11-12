import type { ChatInputCommandInteraction } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import { replyEphemeral } from "../../../core/discord/interaction-replies.ts"
import { findPersona, personaLabel } from "../persona-catalog.ts"
import { resolveEditableChat } from "./resolve-editable-chat.ts"

export async function setPersona(
  interaction: ChatInputCommandInteraction<"cached">,
  context: CoreContext,
) {
  const personaId = interaction.options.getString("persona", true)
  const persona = findPersona(personaId)

  if (!persona) {
    await replyEphemeral(interaction, `Unknown persona \`${personaId}\`. See \`/persona list\`.`)
    return
  }

  const target = await resolveEditableChat(interaction, context)

  if (!target) {
    return
  }

  context.sessions.threads.update(target.thread.threadId, {
    personaId: persona.id,
    systemPrompt: null,
  })

  await interaction.reply({
    content: `🎭 <@${interaction.user.id}> switched this chat to the **${personaLabel(persona)}** persona.`,
  })
}
