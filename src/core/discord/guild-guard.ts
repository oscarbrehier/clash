import { type Client, Events, type Guild } from "discord.js"
import type { Logger } from "../logging/logger.ts"
import type { AccessPolicy } from "./access-policy.ts"

export function installGuildGuard(client: Client, access: AccessPolicy, logger: Logger) {
  const log = logger.child("guild-guard")

  const leaveIfNotAllowed = async (guild: Guild) => {
    if (access.isGuildAllowed(guild.id)) {
      return
    }

    log.warn(`Leaving guild "${guild.name}" (${guild.id}): not in ALLOWED_GUILD_IDS`)

    try {
      await guild.leave()
    } catch (error) {
      log.error(`Could not leave guild ${guild.id}`, error)
    }
  }

  client.once(Events.ClientReady, async (readyClient) => {
    const guilds = [...readyClient.guilds.cache.values()]

    await Promise.all(guilds.map(leaveIfNotAllowed))
  })

  client.on(Events.GuildCreate, leaveIfNotAllowed)
}
