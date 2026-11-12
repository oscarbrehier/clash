import type { FilePart, ModelMessage, TextPart } from "ai"
import type { ModelDefinition } from "../../../core/config/model-catalog.ts"
import type { StoredImage } from "../../../core/db/schema/message-images.ts"
import type { MessageRecord } from "../../../core/db/schema/messages.ts"

const imageUnavailableNote =
  "[An image was attached here, but the current model cannot view images.]"

export function toModelMessage(
  record: MessageRecord,
  images: readonly StoredImage[],
  model: ModelDefinition,
): ModelMessage {
  if (record.role === "assistant") {
    return { role: "assistant", content: record.content }
  }

  if (images.length === 0) {
    return { role: "user", content: record.content }
  }

  const textParts: TextPart[] = record.content ? [{ type: "text", text: record.content }] : []
  const imageParts = images.map((image) => imagePartFor(image, model))

  return { role: "user", content: [...textParts, ...imageParts] }
}

function imagePartFor(image: StoredImage, model: ModelDefinition): FilePart | TextPart {
  if (!model.vision) {
    return { type: "text", text: imageUnavailableNote }
  }

  return { type: "file", data: image.data, mediaType: image.mediaType }
}
