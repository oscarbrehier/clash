import type { AnyThreadChannel } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import type { ThreadRecord } from "../../../core/db/schema/threads.ts"
import { type GeneratedTitle, generateTitle } from "./generate-title.ts"

const maxRenameAttempts = 2

export function titleThreadInBackground(context: CoreContext, channel: AnyThreadChannel) {
  titleThread(context, channel).catch((error) => {
    context.logger.child("chat:title").warn(`Could not title thread ${channel.id}`, error)
  })
}

async function titleThread(context: CoreContext, channel: AnyThreadChannel) {
  const threads = context.sessions.threads
  const thread = threads.find(channel.id)

  if (!thread || thread.titled || thread.renameCount >= maxRenameAttempts) {
    return
  }

  threads.update(thread.threadId, { titled: true, renameCount: thread.renameCount + 1 })

  try {
    const generated = await generateTitle(
      context,
      context.sessions.messages.listForThread(channel.id),
    )

    if (generated) {
      await reportTitleUsage(context, thread, generated)
    }

    if (!generated?.title) {
      throw new Error("The title model returned an empty title")
    }

    await channel.setName(generated.title)
  } catch (error) {
    threads.update(thread.threadId, { titled: false })
    throw error
  }
}

async function reportTitleUsage(
  context: CoreContext,
  thread: ThreadRecord,
  generated: GeneratedTitle,
) {
  await context.hooks.emitGenerationCompleted({
    purpose: "title",
    guildId: thread.guildId,
    threadId: thread.threadId,
    userId: thread.ownerId,
    model: context.models.titleModel(),
    usage: generated.usage,
  })
}
