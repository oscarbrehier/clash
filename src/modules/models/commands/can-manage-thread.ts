import type { GuildMember } from "discord.js"
import { canManageChat } from "../../../core/discord/can-manage-chat.ts"
import type { ChatThreadTarget } from "../../../core/discord/resolve-chat-thread.ts"

export function canManageThread(member: GuildMember, target: ChatThreadTarget): boolean {
  return canManageChat(member, target.channel, target.thread.ownerId)
}

export const manageThreadDeniedMessage =
  "Only the person who started this chat, or a moderator, can change it."
