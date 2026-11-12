import type { Client } from "discord.js"
import { models as catalog } from "../../../config/models.ts"
import type { Env } from "../config/env.ts"
import { validateModelCatalog } from "../config/model-catalog.ts"
import type { CoreContext } from "../context.ts"
import type { DatabaseConnection } from "../db/client.ts"
import { createAccessPolicy } from "../discord/access-policy.ts"
import { createHookBus } from "../hooks/hook-bus.ts"
import type { Logger } from "../logging/logger.ts"
import type { BotModule } from "../modules/bot-module.ts"
import { collectHookRegistrations, collectTools } from "../modules/collect-contributions.ts"
import { createModelRegistry } from "../providers/model-registry.ts"
import { createProviderRegistry } from "../providers/provider-registry.ts"
import { providerDefinitions } from "../providers/providers/index.ts"
import { createSessionStore } from "../sessions/session-store.ts"

interface CoreContextInput {
  env: Env
  logger: Logger
  client: Client
  database: DatabaseConnection
  modules: readonly BotModule[]
}

export function createCoreContext(input: CoreContextInput): CoreContext {
  const providers = createProviderRegistry(input.env, providerDefinitions)

  if (providers.enabledProviders().length === 0) {
    throw new Error("No AI provider is configured. Set at least one API key or OLLAMA_BASE_URL.")
  }

  const models = createModelRegistry({
    catalog: validateModelCatalog(catalog),
    providers,
    defaultModelId: input.env.DEFAULT_MODEL_ID,
    titleModelId: input.env.TITLE_MODEL_ID,
  })

  const context: CoreContext = {
    client: input.client,
    env: input.env,
    logger: input.logger,
    db: input.database.db,
    sessions: createSessionStore(input.database.db),
    providers,
    models,
    hooks: createHookBus(collectHookRegistrations(input.modules), () => context),
    tools: collectTools(input.modules),
    access: createAccessPolicy({
      allowedGuildIds: input.env.ALLOWED_GUILD_IDS,
      requiredRoleId: input.env.REQUIRED_ROLE_ID,
    }),
    modules: input.modules,
  }

  return context
}
