import type { Message } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import { startFailureText } from "../discord/start-failure-text.ts"

export async function runChatStart(
  context: CoreContext,
  message: Message<true>,
  start: () => Promise<void>,
) {
  try {
    await start()
  } catch (error) {
    context.logger.child("chat").warn("Could not start a chat from a message", error)
    await message.reply({ content: `⚠️ ${startFailureText(error)}` }).catch(() => undefined)
  }
}
