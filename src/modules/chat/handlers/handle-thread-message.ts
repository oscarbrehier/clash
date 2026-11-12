import type { AnyThreadChannel, Message } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import type { ThreadRecord } from "../../../core/db/schema/threads.ts"
import { cleanPrompt } from "../discord/clean-prompt.ts"
import { isChatForumPost } from "../discord/is-chat-forum-post.ts"
import { memberCanChat } from "../discord/member-can-chat.ts"
import { scheduleGeneration } from "../generation/schedule-generation.ts"
import { ensureSession } from "../sessions/ensure-session.ts"
import { recordUserMessage } from "../sessions/record-user-message.ts"

export async function handleThreadMessage(
  context: CoreContext,
  message: Message<true>,
  channel: AnyThreadChannel,
) {
  if (!memberCanChat(context, message)) {
    return
  }

  const thread = await findOrStartForumSession(context, message, channel)

  if (!thread) {
    return
  }

  const recorded = await recordUserMessage(context, {
    thread,
    authorId: message.author.id,
    text: userText(context, message, channel),
    message,
  })

  if (recorded) {
    scheduleGeneration(context, channel, message.author.id)
  }
}

async function findOrStartForumSession(
  context: CoreContext,
  message: Message<true>,
  channel: AnyThreadChannel,
): Promise<ThreadRecord | undefined> {
  const existing = context.sessions.threads.find(channel.id)

  if (existing) {
    return existing
  }

  if (!isChatForumPost(context, channel)) {
    return undefined
  }

  return ensureSession(context, channel, { ownerId: channel.ownerId ?? message.author.id })
}

function userText(context: CoreContext, message: Message<true>, channel: AnyThreadChannel): string {
  const text = cleanPrompt(message, context.client.user?.id ?? "")
  const isForumStarter = message.id === channel.id && isChatForumPost(context, channel)

  return isForumStarter ? `${channel.name}\n\n${text}`.trim() : text
}
