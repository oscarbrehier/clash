import { defineEvent } from "../../../core/modules/event-handler.ts"
import { handleAskMessage, isAskChannelMessage } from "../handlers/handle-ask-message.ts"
import { handleMention, mentionsBot } from "../handlers/handle-mention.ts"
import { handleThreadMessage } from "../handlers/handle-thread-message.ts"

export const messageCreateEvent = defineEvent({
  event: "messageCreate",

  async execute(context, message) {
    if (message.author.bot || message.system || !message.inGuild()) {
      return
    }

    if (message.channel.isThread()) {
      await handleThreadMessage(context, message, message.channel)
      return
    }

    if (isAskChannelMessage(context, message)) {
      await handleAskMessage(context, message)
      return
    }

    if (mentionsBot(context, message)) {
      await handleMention(context, message)
    }
  },
})
