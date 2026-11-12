import type { TextPart } from "ai"
import { attachmentLimits } from "./attachment-limits.ts"
import type { CharacterBudget } from "./character-budget.ts"

export interface DocumentDetails {
  name: string
  kind: string
  extra?: string
}

export function wrapDocument(
  details: DocumentDetails,
  text: string,
  budget: CharacterBudget,
): TextPart | undefined {
  const allowed = budget.take(Math.min(text.length, attachmentLimits.maxCharactersPerFile))

  if (allowed === 0) {
    return undefined
  }

  const truncated = allowed < text.length
  const attributes = [
    `name="${details.name}"`,
    `type="${details.kind}"`,
    details.extra,
    truncated
      ? `truncated="true" shown_characters="${allowed}" total_characters="${text.length}"`
      : undefined,
  ]
    .filter((attribute): attribute is string => attribute !== undefined)
    .join(" ")

  return {
    type: "text",
    text: `<attachment ${attributes}>\n${text.slice(0, allowed)}\n</attachment>`,
  }
}
