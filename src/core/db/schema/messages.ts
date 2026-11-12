import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { threads } from "./threads.ts"

export type MessageRole = "user" | "assistant"

export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    threadId: text("thread_id")
      .notNull()
      .references(() => threads.threadId, { onDelete: "cascade" }),
    role: text("role").$type<MessageRole>().notNull(),
    content: text("content").notNull(),
    authorId: text("author_id"),
    modelId: text("model_id"),
    discordMessageIds: text("discord_message_ids", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default([]),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [index("messages_thread_created_idx").on(table.threadId, table.createdAt)],
)

export type MessageRecord = typeof messages.$inferSelect

export type NewMessageRecord = typeof messages.$inferInsert
