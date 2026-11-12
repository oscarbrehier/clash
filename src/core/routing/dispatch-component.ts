import type { Interaction } from "discord.js"
import type { CoreContext } from "../context.ts"
import { replyEphemeral } from "../discord/interaction-replies.ts"
import type { ComponentIndex } from "./component-index.ts"
import { decodeCustomId } from "./custom-id.ts"

const expiredComponentMessage = "This button is no longer active."

export async function dispatchComponent(
  interaction: Interaction<"cached">,
  components: ComponentIndex,
  context: CoreContext,
): Promise<boolean> {
  if (interaction.isButton()) {
    const { id, args } = decodeCustomId(interaction.customId)
    const handler = components.button(id)

    await (handler
      ? handler.execute(interaction, args, context)
      : replyEphemeral(interaction, expiredComponentMessage))

    return true
  }

  if (interaction.isStringSelectMenu()) {
    const { id, args } = decodeCustomId(interaction.customId)
    const handler = components.stringSelect(id)

    await (handler
      ? handler.execute(interaction, args, context)
      : replyEphemeral(interaction, expiredComponentMessage))

    return true
  }

  if (interaction.isModalSubmit()) {
    const { id, args } = decodeCustomId(interaction.customId)
    const handler = components.modal(id)

    await (handler
      ? handler.execute(interaction, args, context)
      : replyEphemeral(interaction, expiredComponentMessage))

    return true
  }

  return false
}
