const maxTitleLength = 90

const labelPrefix = /^(title|thread title)\s*:\s*/i

const wrappingCharacters = /^["'`*#\s]+|["'`*\s]+$/g

export function sanitizeTitle(raw: string): string | undefined {
  const firstLine = raw.trim().split("\n")[0] ?? ""

  const cleaned = firstLine
    .replace(labelPrefix, "")
    .replace(wrappingCharacters, "")
    .replace(/[.!]+$/, "")
    .replace(/\s+/g, " ")
    .trim()

  if (cleaned.length === 0) {
    return undefined
  }

  return cleaned.length > maxTitleLength ? `${cleaned.slice(0, maxTitleLength - 1)}…` : cleaned
}
