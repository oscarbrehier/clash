import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export interface ThreadSettings {
  maxOutputTokens?: number
}

export const threads = sqliteTable("threads", {
  threadId: text("thread_id").primaryKey(),
  guildId: text("guild_id").notNull(),
  ownerId: text("owner_id").notNull(),
  modelId: text("model_id"),
  systemPrompt: text("system_prompt"),
  personaId: text("persona_id"),
  settings: text("settings", { mode: "json" }).$type<ThreadSettings>().notNull().default({}),
  renameCount: integer("rename_count").notNull().default(0),
  titled: integer("titled", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
})

export type ThreadRecord = typeof threads.$inferSelect

export type NewThreadRecord = typeof threads.$inferInsert
