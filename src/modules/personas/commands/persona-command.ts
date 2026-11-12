import { type ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import type { SlashCommand } from "../../../core/modules/command-definition.ts"
import { personaChoices } from "../persona-catalog.ts"
import { clearPersona } from "./clear-persona.ts"
import { listPersonasReply } from "./list-personas.ts"
import { openCustomPersona } from "./open-custom-persona.ts"
import { setPersona } from "./set-persona.ts"

type SubcommandHandler = (
  interaction: ChatInputCommandInteraction<"cached">,
  context: CoreContext,
) => Promise<void>

const subcommands: Record<string, SubcommandHandler> = {
  set: setPersona,
  custom: openCustomPersona,
  clear: clearPersona,
  list: listPersonasReply,
}

const data = new SlashCommandBuilder()
  .setName("persona")
  .setDescription("Give this chat a personality or your own instructions")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("set")
      .setDescription("Use a ready-made persona in this chat")
      .addStringOption((option) =>
        option
          .setName("persona")
          .setDescription("Persona to use")
          .setRequired(true)
          .setAutocomplete(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("custom").setDescription("Write your own system prompt for this chat"),
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("clear").setDescription("Go back to the default assistant"),
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("list").setDescription("Show the available personas"),
  )

export const personaCommand: SlashCommand = {
  type: "slash",
  data,

  async execute(interaction, context) {
    const handler = subcommands[interaction.options.getSubcommand()]

    await handler?.(interaction, context)
  },

  async autocomplete(interaction) {
    await interaction.respond(personaChoices(interaction.options.getFocused()))
  },
}
