import type { TextPart } from "ai"

export function attachmentNote(name: string, reason: string): TextPart {
  return {
    type: "text",
    text: `[The user attached "${name}", but it was not included: ${reason}. Let the user know.]`,
  }
}

export const noteReasons = {
  noVision: "the current model cannot view images (a vision model can be picked with /model)",
  tooManyImages: "too many images in one message",
  unsupported: "this file type is not supported",
  binary: "the file does not contain readable text",
  noPdfText: "the PDF has no extractable text (it may be scanned images)",
  noBudget: "the message already contains too much attached text",
  failed: "the file could not be read",
  tooLarge: (limit: string) => `the file is larger than ${limit}`,
} as const
