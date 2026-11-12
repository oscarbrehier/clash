import type { CoreContext } from "../../../core/context.ts"
import { canManageChat } from "../../../core/discord/can-manage-chat.ts"
import { replyEphemeral } from "../../../core/discord/interaction-replies.ts"
import {
  type ChatThreadInteraction,
  type ChatThreadTarget,
  resolveChatThread,
} from "../../../core/discord/resolve-chat-thread.ts"

const deniedMessage =
  "Only the person who started this chat, or a moderator, can change its persona."

export async function resolveEditableChat(
  interaction: ChatThreadInteraction,
  context: CoreContext,
): Promise<ChatThreadTarget | undefined> {
  const target = await resolveChatThread(interaction, context)

  if (!target) {
    return undefined
  }

  if (!canManageChat(interaction.member, target.channel, target.thread.ownerId)) {
    await replyEphemeral(interaction, deniedMessage)
    return undefined
  }

  return target
}
