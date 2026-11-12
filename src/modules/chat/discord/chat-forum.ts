import { type AnyThreadChannel, ChannelType, type ForumChannel, type Guild } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"

export interface ForumPostSpec {
  name: string
  starter: string
}

export function findChatForum(context: CoreContext, guild: Guild): ForumChannel | undefined {
  const forumId = context.env.CHAT_FORUM_CHANNEL_ID
  const channel = forumId ? guild.channels.cache.get(forumId) : undefined

  return channel?.type === ChannelType.GuildForum ? channel : undefined
}

export function createForumPost(
  forum: ForumChannel,
  spec: ForumPostSpec,
): Promise<AnyThreadChannel> {
  return forum.threads.create({ name: spec.name, message: { content: spec.starter } })
}
