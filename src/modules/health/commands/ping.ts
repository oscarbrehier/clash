import { MessageFlags, SlashCommandBuilder } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import type { SlashCommand } from "../../../core/modules/command-definition.ts"

export const pingCommand: SlashCommand = {
  type: "slash",
  data: new SlashCommandBuilder().setName("ping").setDescription("Check that the bot is alive"),

  async execute(interaction, context) {
    await interaction.reply({ content: describeHealth(context), flags: MessageFlags.Ephemeral })
  },
}

function describeHealth(context: CoreContext): string {
  const latency = context.client.ws.ping
  const providers = context.providers.enabledProviders().map((provider) => provider.displayName)
  const modules = context.modules.map((module) => module.name)

  return [
    `🏓 Pong! Gateway latency: ${latency >= 0 ? `${latency} ms` : "measuring…"}`,
    `**Providers:** ${providers.join(", ")}`,
    `**Models:** ${context.models.list().length} available, default \`${context.models.defaultModel().id}\``,
    `**Modules:** ${modules.join(", ")}`,
  ].join("\n")
}
