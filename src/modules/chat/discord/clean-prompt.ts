import { cleanContent, type Message } from "discord.js"

export function cleanPrompt(message: Message<true>, botUserId: string): string {
  const botMention = new RegExp(`<@!?${botUserId}>`, "g")
  const withoutBotMention = message.content.replace(botMention, "")

  return cleanContent(withoutBotMention, message.channel).trim()
}
