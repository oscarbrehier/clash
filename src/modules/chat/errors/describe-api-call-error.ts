import type { APICallError } from "ai"
import type { ErrorSubject } from "./describe-error.ts"

const detailLength = 160

const contextOverflowPattern = /context|too long|too many tokens|maximum.*tokens|prompt is too/i

export function describeApiCallError(error: APICallError, subject: ErrorSubject): string {
  const status = error.statusCode
  const provider = subject.providerName

  if (status === 401 || status === 403) {
    return `${provider} rejected the API key. Check the bot's configuration.`
  }

  if (status === 404) {
    return `${provider} does not know the model behind ${subject.modelName}. Check its ID in config/models.ts.`
  }

  if (status === 429) {
    return `${provider} is rate limiting requests or the quota is used up. Try again in a moment.`
  }

  if (status === 408 || status === 504) {
    return `${provider} took too long to answer. Please try again.`
  }

  if (status === 413 || contextOverflowPattern.test(error.message)) {
    return `This conversation is too long for ${subject.modelName}. Start a new chat or switch to a model with a larger context window.`
  }

  if (status !== undefined && status >= 500) {
    return `${provider} is unavailable or overloaded right now. Please try again shortly.`
  }

  return `${provider} rejected the request: ${shorten(error.message)}`
}

function shorten(text: string): string {
  const singleLine = text.replace(/\s+/g, " ").trim()

  return singleLine.length > detailLength ? `${singleLine.slice(0, detailLength)}…` : singleLine
}
