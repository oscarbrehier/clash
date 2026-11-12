import type { ChatInputCommandInteraction } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import { buildCustomPersonaModal } from "../components/custom-persona-modal.ts"
import { resolveEditableChat } from "./resolve-editable-chat.ts"

export async function openCustomPersona(
  interaction: ChatInputCommandInteraction<"cached">,
  context: CoreContext,
) {
  const target = await resolveEditableChat(interaction, context)

  if (!target) {
    return
  }

  await interaction.showModal(buildCustomPersonaModal(target.thread))
}
