import type { Client } from "discord.js"
import type { DatabaseConnection } from "../db/client.ts"
import type { Logger } from "../logging/logger.ts"

const shutdownSignals = ["SIGINT", "SIGTERM"] as const

export function installShutdown(client: Client, database: DatabaseConnection, logger: Logger) {
  let shuttingDown = false

  const shutdown = async (signal: string) => {
    if (shuttingDown) {
      return
    }

    shuttingDown = true
    logger.info(`Received ${signal}, shutting down`)

    await client.destroy()
    database.close()
    process.exit(0)
  }

  for (const signal of shutdownSignals) {
    process.on(signal, () => void shutdown(signal))
  }
}
