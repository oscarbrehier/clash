import type { Database } from "../db/client.ts"
import { createGuildSettingsStore, type GuildSettingsStore } from "./guild-settings-store.ts"
import { createMessageStore, type MessageStore } from "./message-store.ts"
import { createThreadStore, type ThreadStore } from "./thread-store.ts"

export interface SessionStore {
  threads: ThreadStore
  messages: MessageStore
  guilds: GuildSettingsStore
}

export function createSessionStore(db: Database): SessionStore {
  return {
    threads: createThreadStore(db),
    messages: createMessageStore(db),
    guilds: createGuildSettingsStore(db),
  }
}
