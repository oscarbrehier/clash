import { attachmentLimits, formatBytes } from "../attachment-limits.ts"
import { attachmentNote, noteReasons } from "../attachment-notes.ts"
import { type AttachmentSource, mediaTypeOf } from "../attachment-source.ts"
import { downloadAttachment } from "../download-attachment.ts"
import type { AttachmentPart, ReadState } from "./read-state.ts"

export async function readImage(
  attachment: AttachmentSource,
  state: ReadState,
): Promise<AttachmentPart> {
  if (!state.model.vision) {
    return attachmentNote(attachment.name, noteReasons.noVision)
  }

  if (state.imagesIncluded >= attachmentLimits.maxImagesPerMessage) {
    return attachmentNote(attachment.name, noteReasons.tooManyImages)
  }

  if (attachment.size > attachmentLimits.maxImageBytes) {
    return attachmentNote(
      attachment.name,
      noteReasons.tooLarge(formatBytes(attachmentLimits.maxImageBytes)),
    )
  }

  const data = await downloadAttachment(attachment)
  state.imagesIncluded += 1

  return { type: "file", data, mediaType: mediaTypeOf(attachment), filename: attachment.name }
}
