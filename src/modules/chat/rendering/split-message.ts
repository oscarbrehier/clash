import { closingFence, openFenceAfter } from "./code-fences.ts"
import { findBreakIndex } from "./find-break.ts"

export const chunkLimit = 1900

export function splitMessage(text: string, limit = chunkLimit): string[] {
  const chunks: string[] = []
  let remaining = text
  let carriedFence: string | undefined

  while (remaining.length > 0) {
    const prefix = carriedFence ? `${carriedFence}\n` : ""

    if (prefix.length + remaining.length <= limit) {
      chunks.push(prefix + remaining)
      break
    }

    const cut = findBreakIndex(remaining, limit - prefix.length - closingFence.length)
    const piece = remaining.slice(0, cut).trimEnd()
    const openFence = openFenceAfter(carriedFence, piece)

    chunks.push(prefix + piece + (openFence ? closingFence : ""))

    carriedFence = openFence
    remaining = remaining.slice(cut).replace(/^\n+/, "")
  }

  return chunks.filter((chunk) => chunk.trim().length > 0)
}
