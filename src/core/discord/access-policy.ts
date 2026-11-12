import { type GuildMember, PermissionFlagsBits } from "discord.js"

export interface AccessPolicy {
  isGuildAllowed(guildId: string): boolean
  canUse(member: GuildMember): boolean
}

interface AccessPolicyOptions {
  allowedGuildIds: readonly string[]
  requiredRoleId: string | undefined
}

export function createAccessPolicy(options: AccessPolicyOptions): AccessPolicy {
  const allowedGuilds = new Set(options.allowedGuildIds)

  const isGuildAllowed = (guildId: string) => allowedGuilds.has(guildId)

  const canUse = (member: GuildMember) => {
    if (!isGuildAllowed(member.guild.id)) {
      return false
    }

    if (!options.requiredRoleId) {
      return true
    }

    if (member.permissions.has(PermissionFlagsBits.Administrator)) {
      return true
    }

    return member.roles.cache.has(options.requiredRoleId)
  }

  return { isGuildAllowed, canUse }
}
