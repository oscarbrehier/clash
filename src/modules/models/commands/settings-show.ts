import type { ChatInputCommandInteraction } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import { replyEphemeral } from "../../../core/discord/interaction-replies.ts"
import type { ChatThreadTarget } from "../../../core/discord/resolve-chat-thread.ts"
import { formatTokenCount } from "../../../core/formatting/format-tokens.ts"
import { resolveThreadModel } from "../../../core/sessions/resolve-thread-model.ts"
import { describeModel } from "../format/describe-model.ts"

export async function showSettings(
  interaction: ChatInputCommandInteraction<"cached">,
  context: CoreContext,
  target: ChatThreadTarget,
) {
  const { thread } = target
  const model = resolveThreadModel(context, thread)
  const maxTokens = thread.settings.maxOutputTokens

  const lines = [
    `**Model:** ${describeModel(context, model)}`,
    `**Max reply length:** ${maxTokens ? `${formatTokenCount(maxTokens)} tokens` : `model default (${formatTokenCount(model.maxOutputTokens)} tokens)`}`,
    `**Persona:** ${thread.personaId ?? "default"}`,
    `**Custom system prompt:** ${thread.systemPrompt ? "yes" : "no"}`,
    `**Started by:** <@${thread.ownerId}>`,
  ]

  await replyEphemeral(interaction, lines.join("\n"))
}
