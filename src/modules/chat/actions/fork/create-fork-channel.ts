import { type AnyThreadChannel, ChannelType } from "discord.js"
import { createForumPost, type ForumPostSpec } from "../../discord/chat-forum.ts"
import { createTextThread } from "../../discord/text-thread.ts"

const maxThreadNameLength = 100

export function forkName(originalName: string): string {
  const name = `🍴 ${originalName}`

  return name.length > maxThreadNameLength ? `${name.slice(0, maxThreadNameLength - 1)}…` : name
}

export function forkStarter(userId: string, origin: AnyThreadChannel, copiedCount: number): string {
  return `🍴 <@${userId}> forked <#${origin.id}> · ${copiedCount} messages copied. Continue the conversation below.`
}

export async function createForkChannel(
  origin: AnyThreadChannel,
  spec: ForumPostSpec,
): Promise<AnyThreadChannel | undefined> {
  const parent = origin.parent

  if (parent?.type === ChannelType.GuildForum) {
    return createForumPost(parent, spec)
  }

  if (parent?.type === ChannelType.GuildText) {
    return createTextThread(parent, spec)
  }

  return undefined
}
