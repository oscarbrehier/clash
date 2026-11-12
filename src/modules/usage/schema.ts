import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core"
import type { GenerationPurpose } from "../../core/hooks/chat-hooks.ts"

export const usageEvents = sqliteTable(
  "usage_events",
  {
    id: text("id").primaryKey(),
    guildId: text("guild_id").notNull(),
    threadId: text("thread_id").notNull(),
    userId: text("user_id").notNull(),
    modelId: text("model_id").notNull(),
    purpose: text("purpose").$type<GenerationPurpose>().notNull(),
    inputTokens: integer("input_tokens").notNull().default(0),
    cachedInputTokens: integer("cached_input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    reasoningTokens: integer("reasoning_tokens").notNull().default(0),
    costUsd: real("cost_usd"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("usage_guild_user_created_idx").on(table.guildId, table.userId, table.createdAt),
    index("usage_guild_created_idx").on(table.guildId, table.createdAt),
  ],
)
