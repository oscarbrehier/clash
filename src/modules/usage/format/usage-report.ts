import type { ModelUsage, UserUsage } from "../queries/summarize-usage.ts"
import { combineTotals } from "./combine-totals.ts"
import { describeTotals } from "./describe-totals.ts"

const maxModelLines = 15

const footnote =
  "-# Costs are estimates based on the prices in config/models.ts. Title generation is included."

export interface UsageReportInput {
  heading: string
  periodLabel: string
  models: readonly ModelUsage[]
  users?: readonly UserUsage[]
  modelName: (modelId: string) => string
}

export function usageReport(input: UsageReportInput): string {
  if (input.models.length === 0) {
    return `📊 ${input.heading} · ${input.periodLabel}\nNo usage recorded yet.`
  }

  return [
    `📊 ${input.heading} · ${input.periodLabel}`,
    `**Total:** ${describeTotals(combineTotals(input.models))}`,
    "",
    "**By model**",
    ...modelLines(input),
    ...userSection(input.users),
    "",
    footnote,
  ].join("\n")
}

function modelLines(input: UsageReportInput): string[] {
  return input.models
    .slice(0, maxModelLines)
    .map((row) => `• **${input.modelName(row.modelId)}** — ${describeTotals(row)}`)
}

function userSection(users: readonly UserUsage[] | undefined): string[] {
  if (!users || users.length === 0) {
    return []
  }

  const lines = users.map((row, index) => `${index + 1}. <@${row.userId}> — ${describeTotals(row)}`)

  return ["", "**Top users**", ...lines]
}
