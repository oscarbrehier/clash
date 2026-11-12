import type { FilePart, TextPart } from "ai"
import type { Message } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import type { StoredImage } from "../../../core/db/schema/message-images.ts"
import type { ThreadRecord } from "../../../core/db/schema/threads.ts"
import type { UserContentParts } from "../../../core/hooks/chat-hooks.ts"
import { resolveThreadModel } from "../../../core/sessions/resolve-thread-model.ts"

export interface UserMessageInput {
  thread: ThreadRecord
  authorId: string
  text: string
  message: Message<true> | undefined
}

export async function recordUserMessage(
  context: CoreContext,
  input: UserMessageInput,
): Promise<boolean> {
  const parts = await context.hooks.transformUserInput({
    message: input.message,
    thread: input.thread,
    model: resolveThreadModel(context, input.thread),
    parts: input.text ? [{ type: "text", text: input.text }] : [],
  })

  const content = textOf(parts)
  const images = imagesOf(parts)

  if (content.length === 0 && images.length === 0) {
    return false
  }

  context.sessions.messages.append(
    {
      threadId: input.thread.threadId,
      role: "user",
      content,
      authorId: input.authorId,
      discordMessageIds: input.message ? [input.message.id] : [],
    },
    images,
  )

  return true
}

function textOf(parts: UserContentParts): string {
  return parts
    .filter((part): part is TextPart => part.type === "text")
    .map((part) => part.text)
    .join("\n\n")
    .trim()
}

function imagesOf(parts: UserContentParts): StoredImage[] {
  return parts
    .filter((part): part is FilePart => part.type === "file")
    .filter((part) => part.mediaType.startsWith("image/"))
    .flatMap((part) =>
      part.data instanceof Uint8Array ? [{ mediaType: part.mediaType, data: part.data }] : [],
    )
}
