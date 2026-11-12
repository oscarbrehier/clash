import { ActionRowBuilder, type AnyThreadChannel, ButtonBuilder, ButtonStyle } from "discord.js"

export interface LinkReply {
  content: string
  components: ActionRowBuilder<ButtonBuilder>[]
}

export function openChatReply(channel: AnyThreadChannel, lead = "Started a chat"): LinkReply {
  const button = new ButtonBuilder()
    .setStyle(ButtonStyle.Link)
    .setLabel("Open chat")
    .setEmoji("💬")
    .setURL(channel.url)

  return {
    content: `${lead}: <#${channel.id}>`,
    components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button)],
  }
}
