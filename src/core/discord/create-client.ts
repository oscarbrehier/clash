import { Client, GatewayIntentBits, type RateLimitData } from "discord.js"

const longestAcceptableRateLimitWaitMs = 30_000

export function createDiscordClient(): Client {
  return new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
    allowedMentions: { parse: [], repliedUser: false },
    rest: { rejectOnRateLimit: rejectLongRateLimitWaits },
  })
}

function rejectLongRateLimitWaits(rateLimit: RateLimitData): boolean {
  return rateLimit.timeToReset > longestAcceptableRateLimitWaitMs
}
