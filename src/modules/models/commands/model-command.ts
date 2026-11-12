import { type ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import { replyEphemeral } from "../../../core/discord/interaction-replies.ts"
import { resolveChatThread } from "../../../core/discord/resolve-chat-thread.ts"
import type { SlashCommand } from "../../../core/modules/command-definition.ts"
import { resolveThreadModel } from "../../../core/sessions/resolve-thread-model.ts"
import { describeModel } from "../format/describe-model.ts"
import { autocompleteModel } from "./autocomplete-model.ts"
import { canManageThread, manageThreadDeniedMessage } from "./can-manage-thread.ts"

const data = new SlashCommandBuilder()
  .setName("model")
  .setDescription("Show or change the model of this chat")
  .addStringOption((option) =>
    option.setName("model").setDescription("Model to switch to").setAutocomplete(true),
  )

export const modelCommand: SlashCommand = {
  type: "slash",
  data,
  execute: changeThreadModel,
  autocomplete: autocompleteModel,
}

async function changeThreadModel(
  interaction: ChatInputCommandInteraction<"cached">,
  context: CoreContext,
) {
  const target = await resolveChatThread(interaction, context)

  if (!target) {
    return
  }

  const current = resolveThreadModel(context, target.thread)
  const requestedId = interaction.options.getString("model")

  if (!requestedId) {
    await replyEphemeral(interaction, `This chat uses ${describeModel(context, current)}.`)
    return
  }

  const next = context.models.find(requestedId)

  if (!next) {
    await replyEphemeral(interaction, `Unknown model \`${requestedId}\`.`)
    return
  }

  if (!canManageThread(interaction.member, target)) {
    await replyEphemeral(interaction, manageThreadDeniedMessage)
    return
  }

  if (next.id === current.id) {
    await replyEphemeral(interaction, `This chat already uses **${current.displayName}**.`)
    return
  }

  const thread = context.sessions.threads.update(target.thread.threadId, { modelId: next.id })

  await interaction.reply({
    content: `🔁 Switched this chat from **${current.displayName}** to **${next.displayName}**.`,
  })

  if (thread) {
    await context.hooks.emitModelChanged({
      thread,
      channel: target.channel,
      previousModel: current,
      model: next,
    })
  }
}
