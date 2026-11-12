import { type AnyThreadChannel, type GuildMember, PermissionFlagsBits } from "discord.js"

export function canManageChat(
  member: GuildMember,
  channel: AnyThreadChannel,
  ownerId: string,
): boolean {
  if (member.id === ownerId) {
    return true
  }

  return member.permissionsIn(channel).has(PermissionFlagsBits.ManageThreads)
}
