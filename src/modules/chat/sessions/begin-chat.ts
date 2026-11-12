import type { AnyThreadChannel, Message } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import { scheduleGeneration } from "../generation/schedule-generation.ts"
import { ensureSession } from "./ensure-session.ts"
import { recordUserMessage } from "./record-user-message.ts"

export interface ChatStart {
  channel: AnyThreadChannel
  ownerId: string
  prompt: string | undefined
  message: Message<true> | undefined
  modelId?: string
}

export async function beginChat(context: CoreContext, start: ChatStart) {
  const thread = await ensureSession(context, start.channel, {
    ownerId: start.ownerId,
    modelId: start.modelId,
  })

  if (!start.prompt && !start.message) {
    return
  }

  const recorded = await recordUserMessage(context, {
    thread,
    authorId: start.ownerId,
    text: start.prompt ?? "",
    message: start.message,
  })

  if (recorded) {
    scheduleGeneration(context, start.channel, start.ownerId)
  }
}
