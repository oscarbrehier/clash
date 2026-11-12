import { MessageFlags, type RepliableInteraction } from "discord.js"

export async function replyEphemeral(interaction: RepliableInteraction, content: string) {
  if (interaction.deferred) {
    await interaction.editReply({ content })
    return
  }

  if (interaction.replied) {
    await interaction.followUp({ content, flags: MessageFlags.Ephemeral })
    return
  }

  await interaction.reply({ content, flags: MessageFlags.Ephemeral })
}

export async function replyEphemeralSafely(interaction: RepliableInteraction, content: string) {
  try {
    await replyEphemeral(interaction, content)
  } catch {
    return
  }
}
