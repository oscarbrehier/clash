import { eq } from "drizzle-orm"
import type { Database } from "../db/client.ts"
import { type GuildSettingsRecord, guildSettings } from "../db/schema/guild-settings.ts"

export interface GuildSettingsStore {
  find(guildId: string): GuildSettingsRecord | undefined
  setDefaultModel(guildId: string, modelId: string): void
}

export function createGuildSettingsStore(db: Database): GuildSettingsStore {
  return {
    find: (guildId) =>
      db.select().from(guildSettings).where(eq(guildSettings.guildId, guildId)).get(),

    setDefaultModel: (guildId, modelId) => {
      const now = new Date()

      db.insert(guildSettings)
        .values({ guildId, defaultModelId: modelId, updatedAt: now })
        .onConflictDoUpdate({
          target: guildSettings.guildId,
          set: { defaultModelId: modelId, updatedAt: now },
        })
        .run()
    },
  }
}
