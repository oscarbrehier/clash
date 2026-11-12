import { desc, sql } from "drizzle-orm"
import type { Database } from "../../../core/db/client.ts"
import { usageEvents } from "../schema.ts"
import { type UsageFilter, usageConditions } from "./usage-filter.ts"
import { type UsageTotals, usageTotalColumns } from "./usage-totals.ts"

const topUserLimit = 10

export interface ModelUsage extends UsageTotals {
  modelId: string
}

export interface UserUsage extends UsageTotals {
  userId: string
}

const totalTokens = sql`sum(${usageEvents.inputTokens} + ${usageEvents.outputTokens})`

export function usageByModel(db: Database, filter: UsageFilter): ModelUsage[] {
  return db
    .select({ modelId: usageEvents.modelId, ...usageTotalColumns })
    .from(usageEvents)
    .where(usageConditions(filter))
    .groupBy(usageEvents.modelId)
    .orderBy(desc(sql`coalesce(sum(${usageEvents.costUsd}), 0)`), desc(totalTokens))
    .all()
}

export function topUsers(db: Database, filter: UsageFilter): UserUsage[] {
  return db
    .select({ userId: usageEvents.userId, ...usageTotalColumns })
    .from(usageEvents)
    .where(usageConditions(filter))
    .groupBy(usageEvents.userId)
    .orderBy(desc(sql`coalesce(sum(${usageEvents.costUsd}), 0)`), desc(totalTokens))
    .limit(topUserLimit)
    .all()
}
