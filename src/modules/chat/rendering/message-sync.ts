import type { AnyThreadChannel, Message } from "discord.js"
import { noControls, type ReplyControls } from "../actions/reply-controls.ts"

export interface MessageSync {
  sync(chunks: readonly string[], controls: ReplyControls): Promise<void>
  messageIds(): string[]
}

interface SentMessage {
  message: Message
  content: string
  controlsKey: string
}

export function createMessageSync(channel: AnyThreadChannel): MessageSync {
  const sent: SentMessage[] = []

  const upsertChunk = async (index: number, content: string, controls: ReplyControls) => {
    const existing = sent[index]
    const payload = { content, components: controls.rows }

    if (!existing) {
      const message = await channel.send(payload)
      sent.push({ message, content, controlsKey: controls.key })
      return
    }

    if (existing.content === content && existing.controlsKey === controls.key) {
      return
    }

    await existing.message.edit(payload)
    existing.content = content
    existing.controlsKey = controls.key
  }

  const removeExtraMessages = async (keep: number) => {
    while (sent.length > keep) {
      await sent.pop()?.message.delete()
    }
  }

  const sync = async (chunks: readonly string[], controls: ReplyControls) => {
    const lastIndex = chunks.length - 1

    for (const [index, chunk] of chunks.entries()) {
      await upsertChunk(index, chunk, index === lastIndex ? controls : noControls)
    }

    await removeExtraMessages(chunks.length)
  }

  return {
    sync,
    messageIds: () => sent.map((entry) => entry.message.id),
  }
}
