import type { AnyThreadChannel } from "discord.js"
import type { ModelDefinition } from "../../../core/config/model-catalog.ts"
import type { CoreContext } from "../../../core/context.ts"
import { resolveThreadModel } from "../../../core/sessions/resolve-thread-model.ts"
import { streamingControls } from "../actions/reply-controls.ts"
import { retirePreviousReplyControls } from "../actions/retire-previous-controls.ts"
import { chatRuntime } from "../chat-runtime.ts"
import { createStreamRenderer, type StreamRenderer } from "../rendering/stream-renderer.ts"
import { buildPrompt, type GenerationPrompt } from "./build-prompt.ts"
import { consumeStream, type StreamOutcome } from "./consume-stream.ts"
import { finalizeReply } from "./finalize-reply.ts"
import { startStream } from "./start-stream.ts"

export interface GenerationRequest {
  channel: AnyThreadChannel
  userId: string
}

export async function runGeneration(context: CoreContext, request: GenerationRequest) {
  const thread = context.sessions.threads.find(request.channel.id)

  if (!thread) {
    return
  }

  const model = resolveThreadModel(context, thread)
  const prompt = await buildPrompt(context, thread, model)

  if (prompt.messages.length === 0) {
    return
  }

  const log = context.logger.child("chat")
  const { generations } = chatRuntime()
  const replyId = crypto.randomUUID()
  const controller = generations.start(thread.threadId, request.userId)

  retirePreviousReplyControls(context, request.channel)

  const renderer = createStreamRenderer({
    channel: request.channel,
    logger: log,
    streamingControls: streamingControls(thread.threadId),
  })

  log.debug(
    `Generating in ${thread.threadId} with ${model.id} (${prompt.messages.length} messages)`,
  )

  try {
    const outcome = await streamReply(context, {
      model,
      prompt,
      renderer,
      signal: controller.signal,
    })

    await finalizeReply(context, { ...request, replyId, thread, model, renderer, outcome })
  } finally {
    generations.finish(thread.threadId, controller)
  }
}

interface StreamReplyInput {
  model: ModelDefinition
  prompt: GenerationPrompt
  renderer: StreamRenderer
  signal: AbortSignal
}

async function streamReply(context: CoreContext, input: StreamReplyInput): Promise<StreamOutcome> {
  try {
    const stream = startStream(context, input.model, input.prompt, input.signal)

    return await consumeStream(stream.fullStream, input.renderer, input.signal)
  } catch (error) {
    return { text: "", usage: undefined, error, aborted: false }
  }
}
