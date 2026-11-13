import { type ApplicationCommandOptionChoiceData, SlashCommandBuilder } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import type { SlashCommand } from "../../../core/modules/command-definition.ts"
import { modelChoices } from "../../../core/providers/model-choices.ts"
import { personaChoices } from "../../personas/persona-catalog.ts"
import { startNewChat } from "./start-new-chat.ts"

const maxPromptLength = 1_800

const data = new SlashCommandBuilder()
  .setName("chat")
  .setDescription("Chat with the AI")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("new")
      .setDescription("Start a new chat thread")
      .addStringOption((option) =>
        option.setName("prompt").setDescription("Your first message").setMaxLength(maxPromptLength),
      )
      .addStringOption((option) =>
        option.setName("model").setDescription("Model for this chat").setAutocomplete(true),
      )
      .addStringOption((option) =>
        option.setName("persona").setDescription("Persona for this chat").setAutocomplete(true),
      ),
  )

export const chatCommand: SlashCommand = {
  type: "slash",
  data,

  async execute(interaction, context) {
    if (interaction.options.getSubcommand() === "new") {
      await startNewChat(interaction, context)
    }
  },

  async autocomplete(interaction, context) {
    const focused = interaction.options.getFocused(true)

    await interaction.respond(choicesFor(focused.name, focused.value, context))
  },
}

function choicesFor(
  option: string,
  query: string,
  context: CoreContext,
): ApplicationCommandOptionChoiceData<string>[] {
  if (option === "model") {
    return modelChoices(context.models, query)
  }

  if (option === "persona") {
    return personaChoices(query)
  }

  return []
}
