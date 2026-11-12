import type { Interaction } from "discord.js"
import type { CoreContext } from "../context.ts"
import { replyEphemeral } from "../discord/interaction-replies.ts"
import type { CommandIndex } from "./command-index.ts"

const unknownCommandMessage = "This command is not available anymore."

export async function dispatchCommand(
  interaction: Interaction<"cached">,
  commands: CommandIndex,
  context: CoreContext,
): Promise<boolean> {
  if (interaction.isAutocomplete()) {
    const command = commands.slash(interaction.commandName)

    await (command?.autocomplete
      ? command.autocomplete(interaction, context)
      : interaction.respond([]))

    return true
  }

  if (interaction.isChatInputCommand()) {
    const command = commands.slash(interaction.commandName)

    await (command
      ? command.execute(interaction, context)
      : replyEphemeral(interaction, unknownCommandMessage))

    return true
  }

  if (interaction.isMessageContextMenuCommand()) {
    const command = commands.messageContext(interaction.commandName)

    await (command
      ? command.execute(interaction, context)
      : replyEphemeral(interaction, unknownCommandMessage))

    return true
  }

  if (interaction.isUserContextMenuCommand()) {
    const command = commands.userContext(interaction.commandName)

    await (command
      ? command.execute(interaction, context)
      : replyEphemeral(interaction, unknownCommandMessage))

    return true
  }

  return false
}
