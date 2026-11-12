import type { Message } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import { cleanPrompt } from "./clean-prompt.ts"

export interface MessageRequest {
  prompt: string
  attachmentNames: string[]
  topic: string
}

export function readMessageRequest(
  context: CoreContext,
  message: Message<true>,
): MessageRequest | undefined {
  const prompt = cleanPrompt(message, context.client.user?.id ?? "")
  const attachmentNames = [...message.attachments.values()].map((attachment) => attachment.name)

  if (prompt.length === 0 && attachmentNames.length === 0) {
    return undefined
  }

  return { prompt, attachmentNames, topic: prompt || attachmentNames.join(", ") }
}
