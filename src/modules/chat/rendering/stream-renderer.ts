import type { AnyThreadChannel } from "discord.js"
import type { Logger } from "../../../core/logging/logger.ts"
import type { ReplyControls } from "../actions/reply-controls.ts"
import { closingFence, openFenceAfter } from "./code-fences.ts"
import { createMessageSync } from "./message-sync.ts"
import { splitMessage } from "./split-message.ts"
import { createThrottledTask } from "./throttled-task.ts"
import { startTyping } from "./typing-indicator.ts"

const editIntervalMs = 1_200

const streamingCursor = " ▌"

export interface StreamRenderer {
  append(text: string): void
  setStatus(status: string | undefined): void
  finish(finalControls: ReplyControls): Promise<void>
  hasMessages(): boolean
  messageIds(): string[]
}

export interface StreamRendererOptions {
  channel: AnyThreadChannel
  logger: Logger
  streamingControls: ReplyControls
}

export function createStreamRenderer(options: StreamRendererOptions): StreamRenderer {
  let text = ""
  let status: string | undefined
  let streaming = true
  let controls = options.streamingControls

  const typing = startTyping(options.channel)
  const messages = createMessageSync(options.channel)

  const render = async () => {
    const chunks = composeChunks(text, status, streaming)

    if (chunks.length === 0) {
      return
    }

    await messages.sync(chunks, controls)
    typing.stop()
  }

  const throttled = createThrottledTask(render, editIntervalMs, (error) =>
    options.logger.warn("Failed to update streamed reply", error),
  )

  return {
    append(delta) {
      text += delta
      throttled.request()
    },

    setStatus(nextStatus) {
      status = nextStatus
      throttled.request()
    },

    async finish(finalControls) {
      streaming = false
      status = undefined
      controls = finalControls
      await throttled.flush()
      typing.stop()
    },

    hasMessages: () => messages.messageIds().length > 0,

    messageIds: () => messages.messageIds(),
  }
}

function composeChunks(text: string, status: string | undefined, streaming: boolean): string[] {
  const chunks = splitMessage(text)
  const statusLine = status ? `-# ${status}` : undefined

  if (!streaming) {
    return chunks
  }

  const last = chunks.pop()

  if (last === undefined) {
    return statusLine ? [statusLine] : []
  }

  return [...chunks, decorateStreamingChunk(last, statusLine)]
}

function decorateStreamingChunk(chunk: string, statusLine: string | undefined): string {
  const closed = openFenceAfter(undefined, chunk) ? `${chunk}${closingFence}` : chunk
  const withCursor = `${closed}${streamingCursor}`

  return statusLine ? `${withCursor}\n${statusLine}` : withCursor
}
