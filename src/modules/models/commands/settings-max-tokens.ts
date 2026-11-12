import type { ChatInputCommandInteraction } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import { replyEphemeral } from "../../../core/discord/interaction-replies.ts"
import type { ChatThreadTarget } from "../../../core/discord/resolve-chat-thread.ts"
import { formatTokenCount } from "../../../core/formatting/format-tokens.ts"
import { resolveThreadModel } from "../../../core/sessions/resolve-thread-model.ts"
import { canManageThread, manageThreadDeniedMessage } from "./can-manage-thread.ts"

export async function setMaxTokens(
  interaction: ChatInputCommandInteraction<"cached">,
  context: CoreContext,
  target: ChatThreadTarget,
) {
  if (!canManageThread(interaction.member, target)) {
    await replyEphemeral(interaction, manageThreadDeniedMessage)
    return
  }

  const model = resolveThreadModel(context, target.thread)
  const requested = interaction.options.getInteger("value") ?? undefined

  if (requested !== undefined && requested > model.maxOutputTokens) {
    await replyEphemeral(
      interaction,
      `${model.displayName} supports at most ${formatTokenCount(model.maxOutputTokens)} output tokens.`,
    )
    return
  }

  context.sessions.threads.update(target.thread.threadId, {
    settings: { ...target.thread.settings, maxOutputTokens: requested },
  })

  const summary = requested
    ? `Replies in this chat are now limited to ${formatTokenCount(requested)} tokens.`
    : "Reply length is back to the model default."

  await replyEphemeral(interaction, summary)
}
