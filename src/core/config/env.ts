import { z } from "zod"

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value)

const optionalText = z.preprocess(emptyToUndefined, z.string().trim().min(1).optional())

const optionalUrl = z.preprocess(emptyToUndefined, z.url().optional())

const snowflake = z.string().regex(/^\d{17,20}$/, "must be a Discord ID")

const snowflakeList = z
  .preprocess(emptyToUndefined, z.string().optional())
  .transform((value) => splitList(value))
  .pipe(z.array(snowflake))

const optionalSnowflake = z.preprocess(emptyToUndefined, snowflake.optional())

const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1),
  DISCORD_CLIENT_ID: snowflake,
  ALLOWED_GUILD_IDS: snowflakeList.refine((ids) => ids.length > 0, "needs at least one guild ID"),
  DEV_GUILD_IDS: snowflakeList,
  REQUIRED_ROLE_ID: optionalSnowflake,
  CHAT_FORUM_CHANNEL_ID: optionalSnowflake,
  ASK_CHANNEL_ID: optionalSnowflake,

  DEFAULT_MODEL_ID: z.string().min(1),
  TITLE_MODEL_ID: z.string().min(1),

  ANTHROPIC_API_KEY: optionalText,
  OPENAI_API_KEY: optionalText,
  GOOGLE_GENERATIVE_AI_API_KEY: optionalText,
  OPENROUTER_API_KEY: optionalText,
  OLLAMA_BASE_URL: optionalUrl,

  DATABASE_PATH: z.string().min(1).default("./data/bot.db"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
})

export type Env = z.infer<typeof envSchema>

export class EnvValidationError extends Error {
  constructor(readonly problems: string[]) {
    super(`Invalid environment:\n${problems.map((problem) => `  - ${problem}`).join("\n")}`)
  }
}

export function loadEnv(source: Record<string, string | undefined> = process.env): Env {
  const result = envSchema.safeParse(source)

  if (result.success) {
    return result.data
  }

  const problems = result.error.issues.map(
    (issue) => `${issue.path.join(".") || "env"}: ${issue.message}`,
  )

  throw new EnvValidationError(problems)
}

function splitList(value: string | undefined): string[] {
  if (!value) {
    return []
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}
