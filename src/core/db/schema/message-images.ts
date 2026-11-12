import { blob, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { messages } from "./messages.ts"

export const messageImages = sqliteTable(
  "message_images",
  {
    id: text("id").primaryKey(),
    messageId: text("message_id")
      .notNull()
      .references(() => messages.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    mediaType: text("media_type").notNull(),
    data: blob("data", { mode: "buffer" }).notNull(),
  },
  (table) => [index("message_images_message_idx").on(table.messageId, table.position)],
)

export type MessageImageRecord = typeof messageImages.$inferSelect

export interface StoredImage {
  mediaType: string
  data: Uint8Array
}
