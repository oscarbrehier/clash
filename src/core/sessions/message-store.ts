import { asc, eq, inArray, sql } from "drizzle-orm"
import type { Database } from "../db/client.ts"
import { messageImages, type StoredImage } from "../db/schema/message-images.ts"
import { type MessageRecord, messages, type NewMessageRecord } from "../db/schema/messages.ts"

export type NewMessage = Omit<NewMessageRecord, "id"> & { id?: string }

export interface MessageStore {
  append(message: NewMessage, images?: readonly StoredImage[]): MessageRecord
  find(messageId: string): MessageRecord | undefined
  listForThread(threadId: string): MessageRecord[]
  latestForThread(threadId: string): MessageRecord | undefined
  imagesFor(messageIds: readonly string[]): Map<string, StoredImage[]>
  setDiscordMessageIds(messageId: string, discordMessageIds: string[]): void
  setContent(messageId: string, content: string): void
  remove(messageId: string): void
}

const insertionOrder = sql`rowid`

export function createMessageStore(db: Database): MessageStore {
  const listForThread = (threadId: string) =>
    db
      .select()
      .from(messages)
      .where(eq(messages.threadId, threadId))
      .orderBy(asc(messages.createdAt), asc(insertionOrder))
      .all()

  const append = (message: NewMessage, images: readonly StoredImage[] = []) =>
    db.transaction((transaction) => {
      const record = transaction
        .insert(messages)
        .values({ ...message, id: message.id ?? crypto.randomUUID() })
        .returning()
        .get()

      for (const [position, image] of images.entries()) {
        transaction
          .insert(messageImages)
          .values({
            id: crypto.randomUUID(),
            messageId: record.id,
            position,
            mediaType: image.mediaType,
            data: Buffer.from(image.data),
          })
          .run()
      }

      return record
    })

  const imagesFor = (messageIds: readonly string[]) => {
    const byMessage = new Map<string, StoredImage[]>()

    if (messageIds.length === 0) {
      return byMessage
    }

    const rows = db
      .select()
      .from(messageImages)
      .where(inArray(messageImages.messageId, [...messageIds]))
      .orderBy(asc(messageImages.position))
      .all()

    for (const row of rows) {
      const images = byMessage.get(row.messageId) ?? []
      images.push({ mediaType: row.mediaType, data: row.data })
      byMessage.set(row.messageId, images)
    }

    return byMessage
  }

  return {
    append,

    find: (messageId) => db.select().from(messages).where(eq(messages.id, messageId)).get(),

    listForThread,

    latestForThread: (threadId) => listForThread(threadId).at(-1),

    imagesFor,

    setDiscordMessageIds: (messageId, discordMessageIds) => {
      db.update(messages).set({ discordMessageIds }).where(eq(messages.id, messageId)).run()
    },

    setContent: (messageId, content) => {
      db.update(messages).set({ content }).where(eq(messages.id, messageId)).run()
    },

    remove: (messageId) => {
      db.delete(messages).where(eq(messages.id, messageId)).run()
    },
  }
}
