import type { AnyThreadChannel } from "discord.js"

const typingRefreshMs = 8_000

export interface TypingIndicator {
  stop(): void
}

export function startTyping(channel: AnyThreadChannel): TypingIndicator {
  const sendTyping = () => {
    channel.sendTyping().catch(() => undefined)
  }

  sendTyping()
  const interval = setInterval(sendTyping, typingRefreshMs)

  return {
    stop: () => clearInterval(interval),
  }
}
