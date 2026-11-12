import type { BotModule } from "./bot-module.ts"

const optionalArrayKeys = ["commands", "components", "events"] as const

const optionalObjectKeys = ["tools", "hooks"] as const

export function assertBotModule(value: unknown, folder: string): asserts value is BotModule {
  const fail = (reason: string): never => {
    throw new Error(`Module "${folder}" is invalid: ${reason}`)
  }

  if (!isRecord(value)) {
    return fail("index.ts must default-export a module object")
  }

  if (typeof value.name !== "string" || value.name.length === 0) {
    return fail("name must be a non-empty string")
  }

  for (const key of optionalArrayKeys) {
    if (value[key] !== undefined && !Array.isArray(value[key])) {
      fail(`${key} must be an array`)
    }
  }

  for (const key of optionalObjectKeys) {
    if (value[key] !== undefined && !isRecord(value[key])) {
      fail(`${key} must be an object`)
    }
  }

  if (value.setup !== undefined && typeof value.setup !== "function") {
    fail("setup must be a function")
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
