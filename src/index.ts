import { startBot } from "./core/bootstrap/start-bot.ts"
import { EnvValidationError } from "./core/config/env.ts"

try {
  await startBot()
} catch (error) {
  const message = error instanceof EnvValidationError ? error.message : error

  console.error("Failed to start the bot:", message)
  process.exit(1)
}
