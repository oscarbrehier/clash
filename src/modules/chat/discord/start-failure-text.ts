import { DiscordAPIError } from "discord.js"
import { describeDiscordError } from "../errors/describe-discord-error.ts"

export function startFailureText(error: unknown): string {
  if (error instanceof DiscordAPIError) {
    return describeDiscordError(error)
  }

  return "I couldn't start a chat here."
}
