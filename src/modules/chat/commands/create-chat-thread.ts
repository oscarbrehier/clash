import { type AnyThreadChannel, ChannelType, type ChatInputCommandInteraction } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import { createForumPost, type ForumPostSpec, findChatForum } from "../discord/chat-forum.ts"
import { createTextThread } from "../discord/text-thread.ts"

export async function createChatThread(
  context: CoreContext,
  interaction: ChatInputCommandInteraction<"cached">,
  spec: ForumPostSpec,
): Promise<AnyThreadChannel | undefined> {
  const forum = findChatForum(context, interaction.guild)

  if (forum) {
    return createForumPost(forum, spec)
  }

  const channel = interaction.channel

  if (channel?.type !== ChannelType.GuildText) {
    return undefined
  }

  return createTextThread(channel, spec)
}
