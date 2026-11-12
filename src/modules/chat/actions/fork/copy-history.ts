import type { CoreContext } from "../../../../core/context.ts"
import type { MessageRecord } from "../../../../core/db/schema/messages.ts"

export function historyUpTo(context: CoreContext, reply: MessageRecord): MessageRecord[] {
  const history = context.sessions.messages.listForThread(reply.threadId)
  const replyIndex = history.findIndex((message) => message.id === reply.id)

  return replyIndex === -1 ? [] : history.slice(0, replyIndex + 1)
}

export function copyHistory(
  context: CoreContext,
  history: readonly MessageRecord[],
  threadId: string,
): MessageRecord | undefined {
  const store = context.sessions.messages
  const images = store.imagesFor(history.map((message) => message.id))

  let lastCopy: MessageRecord | undefined

  for (const message of history) {
    lastCopy = store.append(
      {
        threadId,
        role: message.role,
        content: message.content,
        authorId: message.authorId,
        modelId: message.modelId,
        createdAt: message.createdAt,
        discordMessageIds: [],
      },
      images.get(message.id) ?? [],
    )
  }

  return lastCopy
}
