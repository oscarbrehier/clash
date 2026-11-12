import { Events } from "discord.js"
import { loadEnv } from "../config/env.ts"
import { collectSecrets } from "../config/secrets.ts"
import { openDatabase } from "../db/client.ts"
import { runMigrations } from "../db/migrate.ts"
import { createDiscordClient } from "../discord/create-client.ts"
import { installGuildGuard } from "../discord/guild-guard.ts"
import { createLogger } from "../logging/logger.ts"
import { createRedactor } from "../logging/redact.ts"
import {
  collectCommands,
  collectComponents,
  collectEvents,
} from "../modules/collect-contributions.ts"
import { loadModules } from "../modules/load-modules.ts"
import { bindModuleEvents } from "../routing/route-events.ts"
import { installInteractionRouter } from "../routing/route-interactions.ts"
import { createCoreContext } from "./create-core-context.ts"
import { installShutdown } from "./install-shutdown.ts"
import { logStartupSummary } from "./log-startup-summary.ts"
import { runModuleSetup } from "./run-module-setup.ts"

export async function startBot() {
  const env = loadEnv()
  const logger = createLogger({ level: env.LOG_LEVEL, redact: createRedactor(collectSecrets(env)) })

  const database = openDatabase(env.DATABASE_PATH)
  runMigrations(database.db)

  const modules = await loadModules()
  const client = createDiscordClient()
  const context = createCoreContext({ env, logger, client, database, modules })

  await runModuleSetup(context)

  installGuildGuard(client, context.access, logger)
  bindModuleEvents(client, collectEvents(modules), context)
  installInteractionRouter(client, collectCommands(modules), collectComponents(modules), context)
  installShutdown(client, database, logger)

  client.once(Events.ClientReady, (readyClient) => logStartupSummary(readyClient, context))

  await client.login(env.DISCORD_TOKEN)
}
