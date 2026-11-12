import { type AnyColumn, sql } from "drizzle-orm"
import { usageEvents } from "../schema.ts"

export interface UsageTotals {
  replies: number
  inputTokens: number
  cachedInputTokens: number
  outputTokens: number
  costUsd: number | null
  unpricedEvents: number
}

const sumOf = (column: AnyColumn) => sql<number>`coalesce(sum(${column}), 0)`.mapWith(Number)

export const usageTotalColumns = {
  replies:
    sql<number>`coalesce(sum(case when ${usageEvents.purpose} = 'reply' then 1 else 0 end), 0)`.mapWith(
      Number,
    ),
  inputTokens: sumOf(usageEvents.inputTokens),
  cachedInputTokens: sumOf(usageEvents.cachedInputTokens),
  outputTokens: sumOf(usageEvents.outputTokens),
  costUsd: sql<number | null>`sum(${usageEvents.costUsd})`,
  unpricedEvents:
    sql<number>`coalesce(sum(case when ${usageEvents.costUsd} is null then 1 else 0 end), 0)`.mapWith(
      Number,
    ),
}
