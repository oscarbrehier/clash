import type { LanguageModelUsage, UserContent } from "ai"
import type { AnyThreadChannel, Message } from "discord.js"
import type { ModelDefinition } from "../config/model-catalog.ts"
import type { CoreContext } from "../context.ts"
import type { ThreadRecord } from "../db/schema/threads.ts"

type MaybePromise<T> = T | Promise<T>

export type UserContentParts = Exclude<UserContent, string>

export interface SystemPromptRequest {
  thread: ThreadRecord
  model: ModelDefinition
}

export interface UserInputRequest {
  message: Message<true> | undefined
  thread: ThreadRecord
  model: ModelDefinition
  parts: UserContentParts
}

export type GenerationPurpose = "reply" | "title"

export interface GenerationCompletedEvent {
  purpose: GenerationPurpose
  guildId: string
  threadId: string
  userId: string
  model: ModelDefinition
  usage: LanguageModelUsage
}

export interface SessionStartedEvent {
  thread: ThreadRecord
  channel: AnyThreadChannel
  model: ModelDefinition
}

export interface ModelChangedEvent {
  thread: ThreadRecord
  channel: AnyThreadChannel
  previousModel: ModelDefinition
  model: ModelDefinition
}

export interface ChatHooks {
  resolveSystemPrompt(
    request: SystemPromptRequest,
    context: CoreContext,
  ): MaybePromise<string | undefined>
  transformUserInput(
    request: UserInputRequest,
    context: CoreContext,
  ): MaybePromise<UserContentParts>
  sessionStarted(event: SessionStartedEvent, context: CoreContext): MaybePromise<void>
  generationCompleted(event: GenerationCompletedEvent, context: CoreContext): MaybePromise<void>
  modelChanged(event: ModelChangedEvent, context: CoreContext): MaybePromise<void>
}
