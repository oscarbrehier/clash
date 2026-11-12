import { join } from "node:path"
import { migrate } from "drizzle-orm/bun-sqlite/migrator"
import type { Database } from "./client.ts"

const migrationsFolder = join(import.meta.dir, "..", "..", "..", "drizzle")

export function runMigrations(db: Database) {
  migrate(db, { migrationsFolder })
}
