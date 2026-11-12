import type { Message } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import { createForumPost, findChatForum } from "../discord/chat-forum.ts"
import { memberCanChat } from "../discord/member-can-chat.ts"
import { readMessageRequest } from "../discord/message-request.ts"
import { openChatReply } from "../discord/open-chat-button.ts"
import { starterMessage } from "../discord/starter-message.ts"
import { threadNameFrom } from "../discord/thread-name.ts"
import { startThreadUnderMessage } from "../discord/thread-under-message.ts"
import { beginChat } from "../sessions/begin-chat.ts"
import { runChatStart } from "./run-chat-start.ts"

export function isAskChannelMessage(context: CoreContext, message: Message<true>): boolean {
  const askChannelId = context.env.ASK_CHANNEL_ID

  return askChannelId !== undefined && message.channelId === askChannelId
}

export async function handleAskMessage(context: CoreContext, message: Message<true>) {
  if (!memberCanChat(context, message)) {
    return
  }

  const request = readMessageRequest(context, message)

  if (!request) {
    return
  }

  const start = { ownerId: message.author.id, prompt: request.prompt, message }

  await runChatStart(context, message, async () => {
    const forum = findChatForum(context, message.guild)

    if (!forum) {
      const channel = await startThreadUnderMessage(message, request.topic)
      await beginChat(context, { ...start, channel })
      return
    }

    const post = await createForumPost(forum, {
      name: threadNameFrom(request.topic),
      starter: starterMessage(message.author.id, request.prompt, request.attachmentNames),
    })

    await beginChat(context, { ...start, channel: post })
    await message.reply(openChatReply(post))
  })
}
