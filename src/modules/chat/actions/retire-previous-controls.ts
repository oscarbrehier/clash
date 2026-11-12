import type { AnyThreadChannel } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import { finishedControls } from "./reply-controls.ts"

export function retirePreviousReplyControls(context: CoreContext, channel: AnyThreadChannel) {
  const previous = context.sessions.messages
    .listForThread(channel.id)
    .findLast((message) => message.role === "assistant")

  const lastDiscordId = previous?.discordMessageIds.at(-1)

  if (!previous || !lastDiscordId) {
    return
  }

  const controls = finishedControls({ replyId: previous.id, canRegenerate: false, canFork: true })

  channel.messages.edit(lastDiscordId, { components: controls.rows }).catch((error) => {
    context.logger.child("chat").debug("Could not retire the previous reply's buttons", error)
  })
}
