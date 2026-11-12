import type { AnyThreadChannel } from "discord.js"
import type { CoreContext } from "../../../../core/context.ts"
import type { MessageRecord } from "../../../../core/db/schema/messages.ts"
import { createMessageSync } from "../../rendering/message-sync.ts"
import { splitMessage } from "../../rendering/split-message.ts"
import { finishedControls } from "../reply-controls.ts"

export async function postForkPreview(
  context: CoreContext,
  channel: AnyThreadChannel,
  reply: MessageRecord | undefined,
) {
  if (reply?.role !== "assistant") {
    return
  }

  const messages = createMessageSync(channel)
  const controls = finishedControls({ replyId: reply.id, canRegenerate: true, canFork: true })

  await messages.sync(splitMessage(reply.content), controls)

  context.sessions.messages.setDiscordMessageIds(reply.id, messages.messageIds())
}
