import { eq } from "drizzle-orm"
import type { Database } from "../db/client.ts"
import { type NewThreadRecord, type ThreadRecord, threads } from "../db/schema/threads.ts"

export type ThreadPatch = Partial<Omit<ThreadRecord, "threadId" | "guildId" | "createdAt">>

export interface ThreadStore {
  find(threadId: string): ThreadRecord | undefined
  create(thread: NewThreadRecord): ThreadRecord
  update(threadId: string, patch: ThreadPatch): ThreadRecord | undefined
  remove(threadId: string): void
}

export function createThreadStore(db: Database): ThreadStore {
  return {
    find: (threadId) => db.select().from(threads).where(eq(threads.threadId, threadId)).get(),

    create: (thread) => db.insert(threads).values(thread).returning().get(),

    update: (threadId, patch) =>
      db
        .update(threads)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(threads.threadId, threadId))
        .returning()
        .get(),

    remove: (threadId) => {
      db.delete(threads).where(eq(threads.threadId, threadId)).run()
    },
  }
}
