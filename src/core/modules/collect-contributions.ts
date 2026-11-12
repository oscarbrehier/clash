import type { ToolSet } from "ai"
import type { HookRegistration } from "../hooks/hook-bus.ts"
import type { BotModule } from "./bot-module.ts"
import type { CommandDefinition } from "./command-definition.ts"
import type { ComponentHandler } from "./component-handler.ts"
import type { AnyEventHandler } from "./event-handler.ts"

export function collectCommands(modules: readonly BotModule[]): CommandDefinition[] {
  const commands = modules.flatMap((module) => module.commands ?? [])

  assertUnique(
    commands.map((command) => `${command.type}:${command.data.name}`),
    "command",
  )

  return commands
}

export function collectComponents(modules: readonly BotModule[]): ComponentHandler[] {
  const components = modules.flatMap((module) => module.components ?? [])

  assertUnique(
    components.map((component) => `${component.type}:${component.id}`),
    "component",
  )

  return components
}

export function collectEvents(modules: readonly BotModule[]): AnyEventHandler[] {
  return modules.flatMap((module) => module.events ?? [])
}

export function collectTools(modules: readonly BotModule[]): ToolSet {
  const entries = modules.flatMap((module) => Object.entries(module.tools ?? {}))

  assertUnique(
    entries.map(([name]) => name),
    "tool",
  )

  return Object.fromEntries(entries)
}

export function collectHookRegistrations(modules: readonly BotModule[]): HookRegistration[] {
  return modules.flatMap((module) =>
    module.hooks ? [{ moduleName: module.name, hooks: module.hooks }] : [],
  )
}

function assertUnique(keys: readonly string[], kind: string) {
  const seen = new Set<string>()

  for (const key of keys) {
    if (seen.has(key)) {
      throw new Error(`Duplicate ${kind} "${key}" registered by modules`)
    }

    seen.add(key)
  }
}
