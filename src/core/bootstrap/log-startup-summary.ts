import type { Client } from "discord.js"
import type { CoreContext } from "../context.ts"

export function logStartupSummary(client: Client<true>, context: CoreContext) {
  const providerNames = context.providers.enabledProviders().map((provider) => provider.displayName)
  const moduleNames = context.modules.map((module) => module.name)
  const toolNames = Object.keys(context.tools)

  context.logger.info(`Logged in as ${client.user.tag}`)
  context.logger.info(`Providers: ${providerNames.join(", ")}`)
  context.logger.info(`Models: ${context.models.list().length} available`)
  context.logger.info(`Modules: ${moduleNames.join(", ") || "none"}`)
  context.logger.info(`Tools: ${toolNames.join(", ") || "none"}`)
}
