import type { AnyThreadChannel } from "discord.js"
import type { ModelDefinition } from "../../../core/config/model-catalog.ts"
import type { CoreContext } from "../../../core/context.ts"
import type { ThreadRecord } from "../../../core/db/schema/threads.ts"
import { finishedControls, noControls, type ReplyControls } from "../actions/reply-controls.ts"
import { describeError } from "../errors/describe-error.ts"
import type { StreamRenderer } from "../rendering/stream-renderer.ts"
import { titleThreadInBackground } from "../title/title-thread.ts"
import type { StreamOutcome } from "./consume-stream.ts"
import { postErrorNotice } from "./post-notice.ts"

const emptyResponseNotice = "-# The model returned an empty response."

const stoppedNotice = "\n\n-# ⏹️ Stopped."

export interface FinalizeInput {
  channel: AnyThreadChannel
  userId: string
  replyId: string
  thread: ThreadRecord
  model: ModelDefinition
  renderer: StreamRenderer
  outcome: StreamOutcome
}

export async function finalizeReply(context: CoreContext, input: FinalizeInput) {
  const { outcome, renderer } = input
  const log = context.logger.child("chat")
  const hasText = outcome.text.trim().length > 0
  const replyIsVisible = hasText || !outcome.error

  log.debug(
    `Finished ${input.thread.threadId}: ${outcome.text.length} chars, aborted=${outcome.aborted}, error=${outcome.error !== undefined}`,
  )

  const controls = finishedControls({
    replyId: input.replyId,
    canRegenerate: true,
    canFork: hasText,
  })

  appendClosingNotice(input)
  await renderer.finish(replyIsVisible ? controls : noControls)

  storeAssistantMessage(context, input)
  await reportUsage(context, input)

  if (outcome.error) {
    log.warn(`Generation failed in ${input.thread.threadId}`, outcome.error)
    await postFailure(context, input, replyIsVisible ? noControls : controls)
    return
  }

  if (!outcome.aborted) {
    titleThreadInBackground(context, input.channel)
  }
}

function appendClosingNotice({ outcome, renderer }: FinalizeInput) {
  if (outcome.aborted) {
    renderer.append(stoppedNotice)
    return
  }

  if (outcome.text.trim().length === 0 && !outcome.error) {
    renderer.append(emptyResponseNotice)
  }
}

function storeAssistantMessage(context: CoreContext, input: FinalizeInput) {
  if (input.outcome.text.trim().length === 0) {
    return
  }

  context.sessions.messages.append({
    id: input.replyId,
    threadId: input.thread.threadId,
    role: "assistant",
    content: input.outcome.text,
    modelId: input.model.id,
    discordMessageIds: input.renderer.messageIds(),
  })
}

async function reportUsage(context: CoreContext, input: FinalizeInput) {
  if (!input.outcome.usage) {
    return
  }

  await context.hooks.emitGenerationCompleted({
    purpose: "reply",
    guildId: input.thread.guildId,
    threadId: input.thread.threadId,
    userId: input.userId,
    model: input.model,
    usage: input.outcome.usage,
  })
}

async function postFailure(context: CoreContext, input: FinalizeInput, controls: ReplyControls) {
  const subject = {
    providerName: context.providers.displayNameOf(input.model.provider),
    modelName: input.model.displayName,
  }

  await postErrorNotice(
    input.channel,
    describeError(input.outcome.error, subject),
    context.logger.child("chat"),
    controls,
  )
}
