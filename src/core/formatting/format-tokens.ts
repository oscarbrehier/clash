export function formatTokenCount(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${trimDecimal(tokens / 1_000_000)}M`
  }

  if (tokens >= 1_000) {
    return `${trimDecimal(tokens / 1_000)}K`
  }

  return String(tokens)
}

function trimDecimal(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "")
}
