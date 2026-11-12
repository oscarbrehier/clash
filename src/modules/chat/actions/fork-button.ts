import { type ButtonInteraction, MessageFlags } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import { replyEphemeral } from "../../../core/discord/interaction-replies.ts"
import type { ButtonHandler } from "../../../core/modules/component-handler.ts"
import { openChatReply } from "../discord/open-chat-button.ts"
import { ensureSession } from "../sessions/ensure-session.ts"
import { chatThreadOf } from "./chat-thread-of.ts"
import { copyHistory, historyUpTo } from "./fork/copy-history.ts"
import { createForkChannel, forkName, forkStarter } from "./fork/create-fork-channel.ts"
import { postForkPreview } from "./fork/post-fork-preview.ts"
import { forkButtonId } from "./reply-controls.ts"

export const forkButton: ButtonHandler = {
  type: "button",
  id: forkButtonId,
  execute: forkConversation,
}

async function forkConversation(
  interaction: ButtonInteraction<"cached">,
  [replyId]: string[],
  context: CoreContext,
) {
  const chat = chatThreadOf(interaction, context)
  const reply = replyId ? context.sessions.messages.find(replyId) : undefined

  if (!chat || !reply || reply.threadId !== chat.channel.id) {
    await replyEphemeral(interaction, "This reply can no longer be forked.")
    return
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral })

  const history = historyUpTo(context, reply)
  const fork = await createForkChannel(chat.channel, {
    name: forkName(chat.channel.name),
    starter: forkStarter(interaction.user.id, chat.channel, history.length),
  })

  if (!fork) {
    await interaction.editReply({ content: "I can't create a fork in this channel." })
    return
  }

  await ensureSession(context, fork, {
    ownerId: interaction.user.id,
    modelId: chat.thread.modelId ?? undefined,
  })

  context.sessions.threads.update(fork.id, {
    systemPrompt: chat.thread.systemPrompt,
    personaId: chat.thread.personaId,
    settings: chat.thread.settings,
    titled: true,
  })

  await postForkPreview(context, fork, copyHistory(context, history, fork.id))
  await interaction.editReply(openChatReply(fork, "Forked into"))
}
