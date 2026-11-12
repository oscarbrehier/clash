import { formatTokenCount } from "../../../core/formatting/format-tokens.ts"
import type { UsageTotals } from "../queries/usage-totals.ts"
import { formatUsd } from "./format-usd.ts"

export function describeTotals(totals: UsageTotals): string {
  const cached =
    totals.cachedInputTokens > 0 ? ` (${formatTokenCount(totals.cachedInputTokens)} cached)` : ""

  return [
    `${totals.replies} ${totals.replies === 1 ? "reply" : "replies"}`,
    `${formatTokenCount(totals.inputTokens)} in${cached}`,
    `${formatTokenCount(totals.outputTokens)} out`,
    describeCost(totals),
  ].join(" · ")
}

function describeCost(totals: UsageTotals): string {
  if (totals.costUsd === null) {
    return "no price set"
  }

  const partial = totals.unpricedEvents > 0 ? " (some models have no price)" : ""

  return `≈ ${formatUsd(totals.costUsd)}${partial}`
}
