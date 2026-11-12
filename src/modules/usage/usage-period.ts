const hourMs = 60 * 60 * 1000

export const usagePeriods = {
  day: { label: "last 24 hours", choice: "Last 24 hours", durationMs: 24 * hourMs },
  week: { label: "last 7 days", choice: "Last 7 days", durationMs: 7 * 24 * hourMs },
  month: { label: "last 30 days", choice: "Last 30 days", durationMs: 30 * 24 * hourMs },
  all: { label: "all time", choice: "All time", durationMs: undefined },
} as const

export type UsagePeriod = keyof typeof usagePeriods

export const defaultUsagePeriod: UsagePeriod = "month"

export function isUsagePeriod(value: string): value is UsagePeriod {
  return value in usagePeriods
}

export function periodStart(period: UsagePeriod, now: Date = new Date()): Date | undefined {
  const duration = usagePeriods[period].durationMs

  return duration === undefined ? undefined : new Date(now.getTime() - duration)
}
