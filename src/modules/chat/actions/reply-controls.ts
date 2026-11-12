import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"
import { encodeCustomId } from "../../../core/routing/custom-id.ts"

export const stopButtonId = "chat:stop"
export const regenerateButtonId = "chat:regenerate"
export const forkButtonId = "chat:fork"

export interface ReplyControls {
  key: string
  rows: ActionRowBuilder<ButtonBuilder>[]
}

export const noControls: ReplyControls = { key: "none", rows: [] }

export interface FinishedControlsOptions {
  replyId: string
  canRegenerate: boolean
  canFork: boolean
}

export function streamingControls(threadId: string): ReplyControls {
  const stop = new ButtonBuilder()
    .setCustomId(encodeCustomId(stopButtonId, threadId))
    .setStyle(ButtonStyle.Danger)
    .setEmoji("⏹️")
    .setLabel("Stop")

  return { key: "streaming", rows: [rowOf([stop])] }
}

export function finishedControls(options: FinishedControlsOptions): ReplyControls {
  const buttons = [
    options.canRegenerate ? regenerateButton(options.replyId) : undefined,
    options.canFork ? forkButton(options.replyId) : undefined,
  ].filter((button): button is ButtonBuilder => button !== undefined)

  if (buttons.length === 0) {
    return noControls
  }

  const key = `finished:${options.replyId}:${options.canRegenerate}:${options.canFork}`

  return { key, rows: [rowOf(buttons)] }
}

function regenerateButton(replyId: string): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId(encodeCustomId(regenerateButtonId, replyId))
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("🔄")
    .setLabel("Regenerate")
}

function forkButton(replyId: string): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId(encodeCustomId(forkButtonId, replyId))
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("🍴")
    .setLabel("Fork")
}

function rowOf(buttons: ButtonBuilder[]): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(buttons)
}
