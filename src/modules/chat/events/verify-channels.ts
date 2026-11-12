import { ChannelType, type Client } from "discord.js"
import type { Logger } from "../../../core/logging/logger.ts"
import { defineEvent } from "../../../core/modules/event-handler.ts"

export const verifyChannelsEvent = defineEvent({
  event: "clientReady",
  once: true,

  async execute(context, client) {
    const log = context.logger.child("chat")
    const forumId = context.env.CHAT_FORUM_CHANNEL_ID
    const askChannelId = context.env.ASK_CHANNEL_ID

    if (!forumId) {
      log.info("CHAT_FORUM_CHANNEL_ID is not set; chats will open as threads in text channels")
    }

    if (forumId) {
      await verifyChannel(client, log, forumId, ChannelType.GuildForum, "Chat forum")
    }

    if (askChannelId) {
      await verifyChannel(client, log, askChannelId, ChannelType.GuildText, "Ask channel")
    }
  },
})

async function verifyChannel(
  client: Client<true>,
  log: Logger,
  channelId: string,
  expectedType: ChannelType.GuildForum | ChannelType.GuildText,
  label: string,
) {
  const channel = await client.channels.fetch(channelId).catch(() => null)

  if (!channel || channel.type !== expectedType) {
    log.warn(`${label} ${channelId} is not a channel of the expected type that the bot can see`)
    return
  }

  log.info(`${label}: #${channel.name}`)
}
