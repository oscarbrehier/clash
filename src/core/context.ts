import type { ToolSet } from "ai"
import type { Client } from "discord.js"
import type { Env } from "./config/env.ts"
import type { Database } from "./db/client.ts"
import type { AccessPolicy } from "./discord/access-policy.ts"
import type { HookBus } from "./hooks/hook-bus.ts"
import type { Logger } from "./logging/logger.ts"
import type { BotModule } from "./modules/bot-module.ts"
import type { ModelRegistry } from "./providers/model-registry.ts"
import type { ProviderRegistry } from "./providers/provider-registry.ts"
import type { SessionStore } from "./sessions/session-store.ts"

export interface CoreContext {
  client: Client
  env: Env
  logger: Logger
  db: Database
  sessions: SessionStore
  providers: ProviderRegistry
  models: ModelRegistry
  hooks: HookBus
  tools: ToolSet
  access: AccessPolicy
  modules: readonly BotModule[]
}
