import { APICallError, RetryError } from "ai"
import { DiscordAPIError, RateLimitError } from "discord.js"
import { describeApiCallError } from "./describe-api-call-error.ts"
import { describeDiscordError } from "./describe-discord-error.ts"
import { isTimeoutError } from "./generation-timeout-error.ts"

export interface ErrorSubject {
  providerName: string
  modelName: string
}

const fallbackMessage = "Something went wrong while generating a reply. Please try again."

export function describeError(error: unknown, subject: ErrorSubject): string {
  const cause = RetryError.isInstance(error) ? error.lastError : error

  if (isTimeoutError(cause)) {
    return `${subject.modelName} stopped responding, so I gave up. Please try again.`
  }

  if (APICallError.isInstance(cause)) {
    return describeApiCallError(cause, subject)
  }

  if (cause instanceof RateLimitError) {
    return "Discord is rate limiting me right now. Please try again in a minute."
  }

  if (cause instanceof DiscordAPIError) {
    return describeDiscordError(cause)
  }

  return fallbackMessage
}
