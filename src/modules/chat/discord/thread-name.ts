const maxThreadNameLength = 80

const fallbackThreadName = "New chat"

export function threadNameFrom(prompt: string | undefined): string {
  const firstLine = (prompt ?? "").split("\n")[0]?.replace(/\s+/g, " ").trim() ?? ""

  if (firstLine.length === 0) {
    return fallbackThreadName
  }

  if (firstLine.length <= maxThreadNameLength) {
    return firstLine
  }

  return `${firstLine.slice(0, maxThreadNameLength - 1)}…`
}
