import { Database as SqliteDatabase } from "bun:sqlite"
import { mkdirSync } from "node:fs"
import { dirname } from "node:path"
import { type BunSQLiteDatabase, drizzle } from "drizzle-orm/bun-sqlite"

export type Database = BunSQLiteDatabase

export interface DatabaseConnection {
  db: Database
  close(): void
}

export function openDatabase(path: string): DatabaseConnection {
  mkdirSync(dirname(path), { recursive: true })

  const sqlite = new SqliteDatabase(path, { create: true, strict: true })

  sqlite.run("PRAGMA journal_mode = WAL")
  sqlite.run("PRAGMA foreign_keys = ON")

  return {
    db: drizzle({ client: sqlite }),
    close: () => sqlite.close(),
  }
}
