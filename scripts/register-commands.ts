import { REST, type RESTPostAPIApplicationCommandsJSONBody, Routes } from "discord.js"
import { type Env, EnvValidationError, loadEnv } from "../src/core/config/env.ts"
import { collectCommands } from "../src/core/modules/collect-contributions.ts"
import { loadModules } from "../src/core/modules/load-modules.ts"

interface RegisterOptions {
  global: boolean
  clear: boolean
}

function parseOptions(args: readonly string[]): RegisterOptions {
  return {
    global: args.includes("--global"),
    clear: args.includes("--clear"),
  }
}

async function buildCommandBodies(
  clear: boolean,
): Promise<RESTPostAPIApplicationCommandsJSONBody[]> {
  if (clear) {
    return []
  }

  const modules = await loadModules()

  return collectCommands(modules).map((command) => command.data.toJSON())
}

function targetGuildIds(env: Env): string[] {
  return env.DEV_GUILD_IDS.length > 0 ? env.DEV_GUILD_IDS : env.ALLOWED_GUILD_IDS
}

async function register(env: Env, options: RegisterOptions) {
  const rest = new REST().setToken(env.DISCORD_TOKEN)
  const body = await buildCommandBodies(options.clear)
  const names = body.map((command) => command.name).join(", ") || "(none)"

  if (options.global) {
    await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), { body })
    console.log(`Registered ${body.length} global commands: ${names}`)
    return
  }

  for (const guildId of targetGuildIds(env)) {
    await rest.put(Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, guildId), { body })
    console.log(`Registered ${body.length} commands in guild ${guildId}: ${names}`)
  }
}

try {
  await register(loadEnv(), parseOptions(process.argv.slice(2)))
} catch (error) {
  const message = error instanceof EnvValidationError ? error.message : error

  console.error("Command registration failed:", message)
  process.exit(1)
}
