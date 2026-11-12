import type { AnyThreadChannel } from "discord.js"
import type { Logger } from "../../../core/logging/logger.ts"
import { noControls, type ReplyControls } from "../actions/reply-controls.ts"

export async function postErrorNotice(
  channel: AnyThreadChannel,
  text: string,
  logger: Logger,
  controls: ReplyControls = noControls,
) {
  try {
    await channel.send({ content: `⚠️ ${text}`, components: controls.rows })
  } catch (error) {
    logger.warn("Could not post the error notice in the thread", error)
  }
}
