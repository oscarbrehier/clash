import {
  LabelBuilder,
  ModalBuilder,
  type ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import type { ThreadRecord } from "../../../core/db/schema/threads.ts"
import { replyEphemeral } from "../../../core/discord/interaction-replies.ts"
import type { ModalHandler } from "../../../core/modules/component-handler.ts"
import { encodeCustomId } from "../../../core/routing/custom-id.ts"
import { resolveEditableChat } from "../commands/resolve-editable-chat.ts"

const customPersonaModalId = "personas:custom"

const promptInputId = "prompt"

const maxPromptLength = 4_000

const previewLength = 300

export function buildCustomPersonaModal(thread: ThreadRecord): ModalBuilder {
  const input = new TextInputBuilder()
    .setCustomId(promptInputId)
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(maxPromptLength)
    .setPlaceholder("You are a friendly pirate who explains everything with sea metaphors…")

  if (thread.systemPrompt) {
    input.setValue(thread.systemPrompt)
  }

  const label = new LabelBuilder()
    .setLabel("System prompt")
    .setDescription("Instructions the AI follows for every reply in this chat")
    .setTextInputComponent(input)

  return new ModalBuilder()
    .setCustomId(encodeCustomId(customPersonaModalId, thread.threadId))
    .setTitle("Custom persona")
    .addLabelComponents(label)
}

export const customPersonaModal: ModalHandler = {
  type: "modal",
  id: customPersonaModalId,
  execute: saveCustomPersona,
}

async function saveCustomPersona(
  interaction: ModalSubmitInteraction<"cached">,
  [threadId]: string[],
  context: CoreContext,
) {
  const target = await resolveEditableChat(interaction, context)

  if (!target) {
    return
  }

  if (target.thread.threadId !== threadId) {
    await replyEphemeral(interaction, "This form belongs to another chat.")
    return
  }

  const prompt = interaction.fields.getTextInputValue(promptInputId).trim()

  if (prompt.length === 0) {
    await replyEphemeral(
      interaction,
      "The system prompt can't be empty. Use `/persona clear` instead.",
    )
    return
  }

  context.sessions.threads.update(target.thread.threadId, { systemPrompt: prompt, personaId: null })

  await interaction.reply({
    content: `🎭 <@${interaction.user.id}> gave this chat a custom system prompt:\n${quotePreview(prompt)}`,
  })
}

function quotePreview(prompt: string): string {
  const preview = prompt.length > previewLength ? `${prompt.slice(0, previewLength)}…` : prompt

  return preview
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n")
}
