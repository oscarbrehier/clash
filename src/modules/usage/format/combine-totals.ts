import type { UsageTotals } from "../queries/usage-totals.ts"

const emptyTotals: UsageTotals = {
  replies: 0,
  inputTokens: 0,
  cachedInputTokens: 0,
  outputTokens: 0,
  costUsd: null,
  unpricedEvents: 0,
}

export function combineTotals(rows: readonly UsageTotals[]): UsageTotals {
  return rows.reduce<UsageTotals>(
    (total, row) => ({
      replies: total.replies + row.replies,
      inputTokens: total.inputTokens + row.inputTokens,
      cachedInputTokens: total.cachedInputTokens + row.cachedInputTokens,
      outputTokens: total.outputTokens + row.outputTokens,
      costUsd: row.costUsd === null ? total.costUsd : (total.costUsd ?? 0) + row.costUsd,
      unpricedEvents: total.unpricedEvents + row.unpricedEvents,
    }),
    emptyTotals,
  )
}
