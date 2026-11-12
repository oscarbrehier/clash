import type { AnyThreadChannel } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"

export function isChatForumPost(context: CoreContext, channel: AnyThreadChannel): boolean {
  const forumId = context.env.CHAT_FORUM_CHANNEL_ID

  return forumId !== undefined && channel.parentId === forumId
}
