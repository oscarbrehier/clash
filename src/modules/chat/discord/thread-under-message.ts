import { type AnyThreadChannel, type Message, ThreadAutoArchiveDuration } from "discord.js"
import { threadNameFrom } from "./thread-name.ts"

export function startThreadUnderMessage(
  message: Message<true>,
  topic: string,
): Promise<AnyThreadChannel> {
  return message.startThread({
    name: threadNameFrom(topic),
    autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
  })
}
