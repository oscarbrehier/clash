import type { Redactor } from "./redact.ts"

export type LogLevel = "debug" | "info" | "warn" | "error"

export interface Logger {
  debug(message: string, details?: unknown): void
  info(message: string, details?: unknown): void
  warn(message: string, details?: unknown): void
  error(message: string, details?: unknown): void
  child(scope: string): Logger
}

interface LoggerOptions {
  level: LogLevel
  redact: Redactor
  scope?: string
}

const levelRank: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

export function createLogger(options: LoggerOptions): Logger {
  const write = (level: LogLevel, message: string, details?: unknown) => {
    if (levelRank[level] < levelRank[options.level]) {
      return
    }

    const line = formatLine(level, options.scope, message, details)
    const output = level === "error" || level === "warn" ? console.error : console.log

    output(options.redact(line))
  }

  return {
    debug: (message, details) => write("debug", message, details),
    info: (message, details) => write("info", message, details),
    warn: (message, details) => write("warn", message, details),
    error: (message, details) => write("error", message, details),
    child: (scope) => createLogger({ ...options, scope: joinScope(options.scope, scope) }),
  }
}

function formatLine(
  level: LogLevel,
  scope: string | undefined,
  message: string,
  details: unknown,
): string {
  const timestamp = new Date().toISOString()
  const scopeLabel = scope ? ` [${scope}]` : ""
  const header = `${timestamp} ${level.toUpperCase().padEnd(5)}${scopeLabel} ${message}`

  if (details === undefined) {
    return header
  }

  return `${header}\n${formatDetails(details)}`
}

function formatDetails(details: unknown): string {
  if (details instanceof Error) {
    return details.stack ?? `${details.name}: ${details.message}`
  }

  return Bun.inspect(details, { depth: 4 })
}

function joinScope(parent: string | undefined, child: string): string {
  return parent ? `${parent}:${child}` : child
}
