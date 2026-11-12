import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const guildSettings = sqliteTable("guild_settings", {
  guildId: text("guild_id").primaryKey(),
  defaultModelId: text("default_model_id"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
})

export type GuildSettingsRecord = typeof guildSettings.$inferSelect
