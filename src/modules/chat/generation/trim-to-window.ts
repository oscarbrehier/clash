import type { ModelMessage } from "ai"

const charactersPerToken = 4

const nonTextPartTokenEstimate = 1_000

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / charactersPerToken)
}

export function estimateMessageTokens(message: ModelMessage): number {
  if (typeof message.content === "string") {
    return estimateTokens(message.content)
  }

  return message.content.reduce(
    (total, part) =>
      total + (part.type === "text" ? estimateTokens(part.text) : nonTextPartTokenEstimate),
    0,
  )
}

export function trimToWindow(
  messages: readonly ModelMessage[],
  budgetTokens: number,
): ModelMessage[] {
  const kept: ModelMessage[] = []
  let usedTokens = 0

  for (const message of [...messages].reverse()) {
    const cost = estimateMessageTokens(message)

    if (kept.length > 0 && usedTokens + cost > budgetTokens) {
      break
    }

    kept.unshift(message)
    usedTokens += cost
  }

  return dropLeadingAssistantMessages(kept)
}

function dropLeadingAssistantMessages(messages: ModelMessage[]): ModelMessage[] {
  const firstUserIndex = messages.findIndex((message) => message.role === "user")

  return firstUserIndex === -1 ? [] : messages.slice(firstUserIndex)
}
