const fenceMarker = "```"

export const closingFence = `\n${fenceMarker}`

export function openFenceAfter(initialFence: string | undefined, text: string): string | undefined {
  let openFence = initialFence

  for (const line of text.split("\n")) {
    if (!togglesFence(line)) {
      continue
    }

    openFence = openFence ? undefined : openingFenceOf(line)
  }

  return openFence
}

function togglesFence(line: string): boolean {
  const trimmed = line.trimStart()

  if (!trimmed.startsWith(fenceMarker)) {
    return false
  }

  const markerCount = trimmed.split(fenceMarker).length - 1

  return markerCount % 2 === 1
}

function openingFenceOf(line: string): string {
  const language = line.trimStart().slice(fenceMarker.length).trim().split(/\s+/)[0] ?? ""

  return `${fenceMarker}${language}`
}
