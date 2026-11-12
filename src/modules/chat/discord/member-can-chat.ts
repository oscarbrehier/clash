import type { Message } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"

export function memberCanChat(context: CoreContext, message: Message<true>): boolean {
  if (!message.member) {
    return false
  }

  return context.access.canUse(message.member)
}
