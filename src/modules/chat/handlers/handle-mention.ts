import type { Message } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import { memberCanChat } from "../discord/member-can-chat.ts"
import { readMessageRequest } from "../discord/message-request.ts"
import { startThreadUnderMessage } from "../discord/thread-under-message.ts"
import { beginChat } from "../sessions/begin-chat.ts"
import { runChatStart } from "./run-chat-start.ts"

const emptyMentionReply = "Mention me together with a question or a file to start a chat."

export function mentionsBot(context: CoreContext, message: Message<true>): boolean {
  const botId = context.client.user?.id

  return botId !== undefined && message.mentions.users.has(botId)
}

export async function handleMention(context: CoreContext, message: Message<true>) {
  if (!memberCanChat(context, message)) {
    return
  }

  const request = readMessageRequest(context, message)

  if (!request) {
    await message.reply({ content: emptyMentionReply })
    return
  }

  await runChatStart(context, message, async () => {
    const channel = await startThreadUnderMessage(message, request.topic)

    await beginChat(context, {
      channel,
      ownerId: message.author.id,
      prompt: request.prompt,
      message,
    })
  })
}
