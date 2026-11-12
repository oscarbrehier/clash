import { type ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import { resolveChatThread } from "../../../core/discord/resolve-chat-thread.ts"
import type { SlashCommand } from "../../../core/modules/command-definition.ts"
import { setMaxTokens } from "./settings-max-tokens.ts"
import { showSettings } from "./settings-show.ts"

const minimumMaxTokens = 256

const data = new SlashCommandBuilder()
  .setName("settings")
  .setDescription("Settings of this chat")
  .addSubcommand((subcommand) =>
    subcommand.setName("show").setDescription("Show the settings of this chat"),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("max-tokens")
      .setDescription("Limit the length of replies (leave empty to reset)")
      .addIntegerOption((option) =>
        option
          .setName("value")
          .setDescription("Maximum output tokens per reply")
          .setMinValue(minimumMaxTokens),
      ),
  )

export const settingsCommand: SlashCommand = {
  type: "slash",
  data,
  execute: runSettings,
}

async function runSettings(
  interaction: ChatInputCommandInteraction<"cached">,
  context: CoreContext,
) {
  const target = await resolveChatThread(interaction, context)

  if (!target) {
    return
  }

  if (interaction.options.getSubcommand() === "max-tokens") {
    await setMaxTokens(interaction, context, target)
    return
  }

  await showSettings(interaction, context, target)
}
