import {
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import { replyEphemeral } from "../../../core/discord/interaction-replies.ts"
import type { SlashCommand } from "../../../core/modules/command-definition.ts"
import { resolveGuildDefaultModel } from "../../../core/sessions/resolve-thread-model.ts"
import { describeModel } from "../format/describe-model.ts"
import { autocompleteModel } from "./autocomplete-model.ts"

const data = new SlashCommandBuilder()
  .setName("default-model")
  .setDescription("Show or change the default model for new chats (admins)")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addStringOption((option) =>
    option.setName("model").setDescription("New default model").setAutocomplete(true),
  )

export const defaultModelCommand: SlashCommand = {
  type: "slash",
  data,
  execute: changeDefaultModel,
  autocomplete: autocompleteModel,
}

async function changeDefaultModel(
  interaction: ChatInputCommandInteraction<"cached">,
  context: CoreContext,
) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
    await replyEphemeral(interaction, "Only server managers can change the default model.")
    return
  }

  const current = resolveGuildDefaultModel(context, interaction.guildId)
  const requestedId = interaction.options.getString("model")

  if (!requestedId) {
    await replyEphemeral(interaction, `New chats use ${describeModel(context, current)}.`)
    return
  }

  const next = context.models.find(requestedId)

  if (!next) {
    await replyEphemeral(interaction, `Unknown model \`${requestedId}\`.`)
    return
  }

  context.sessions.guilds.setDefaultModel(interaction.guildId, next.id)

  await replyEphemeral(
    interaction,
    `New chats now use **${next.displayName}**. Existing chats keep their current model.`,
  )
}
