interface BreakPreference {
  separator: string
  minimumPosition: number
}

const breakPreferences: readonly BreakPreference[] = [
  { separator: "\n\n", minimumPosition: 0.5 },
  { separator: "\n", minimumPosition: 0.3 },
  { separator: " ", minimumPosition: 0.3 },
]

export function findBreakIndex(text: string, maxLength: number): number {
  if (text.length <= maxLength) {
    return text.length
  }

  const window = text.slice(0, maxLength)

  for (const preference of breakPreferences) {
    const index = window.lastIndexOf(preference.separator)

    if (index >= maxLength * preference.minimumPosition) {
      return index + preference.separator.length
    }
  }

  return maxLength
}
