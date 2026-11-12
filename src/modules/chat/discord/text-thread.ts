import { type AnyThreadChannel, type TextChannel, ThreadAutoArchiveDuration } from "discord.js"
import type { ForumPostSpec } from "./chat-forum.ts"

export async function createTextThread(
  channel: TextChannel,
  spec: ForumPostSpec,
): Promise<AnyThreadChannel> {
  const thread = await channel.threads.create({
    name: spec.name,
    autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
  })

  await thread.send({ content: spec.starter })

  return thread
}
