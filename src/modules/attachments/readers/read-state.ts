import type { FilePart, TextPart } from "ai"
import type { ModelDefinition } from "../../../core/config/model-catalog.ts"
import type { CharacterBudget } from "../character-budget.ts"

export type AttachmentPart = TextPart | FilePart

export interface ReadState {
  model: ModelDefinition
  budget: CharacterBudget
  imagesIncluded: number
}
