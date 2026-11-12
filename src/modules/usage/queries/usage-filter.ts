import { and, eq, gte, type SQL } from "drizzle-orm"
import { usageEvents } from "../schema.ts"

export interface UsageFilter {
  guildId: string
  userId?: string
  since?: Date
}

export function usageConditions(filter: UsageFilter): SQL | undefined {
  return and(
    eq(usageEvents.guildId, filter.guildId),
    filter.userId ? eq(usageEvents.userId, filter.userId) : undefined,
    filter.since ? gte(usageEvents.createdAt, filter.since) : undefined,
  )
}
