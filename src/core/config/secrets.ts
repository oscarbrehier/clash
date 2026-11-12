import type { Env } from "./env.ts"

const secretKeys = [
  "DISCORD_TOKEN",
  "ANTHROPIC_API_KEY",
  "OPENAI_API_KEY",
  "GOOGLE_GENERATIVE_AI_API_KEY",
  "MISTRAL_API_KEY",
  "OPENROUTER_API_KEY",
] as const satisfies readonly (keyof Env)[]

const minimumSecretLength = 8

export function collectSecrets(env: Env): string[] {
  return secretKeys
    .map((key) => env[key])
    .filter((value): value is string => typeof value === "string")
    .filter((value) => value.length >= minimumSecretLength)
}
