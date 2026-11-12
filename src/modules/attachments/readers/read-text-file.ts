import { attachmentLimits, formatBytes } from "../attachment-limits.ts"
import { attachmentNote, noteReasons } from "../attachment-notes.ts"
import type { AttachmentSource } from "../attachment-source.ts"
import { downloadAttachment } from "../download-attachment.ts"
import { wrapDocument } from "../wrap-document.ts"
import type { AttachmentPart, ReadState } from "./read-state.ts"

const nullCharacter = "\u0000"

export async function readTextFile(
  attachment: AttachmentSource,
  state: ReadState,
): Promise<AttachmentPart> {
  if (attachment.size > attachmentLimits.maxTextFileBytes) {
    return attachmentNote(
      attachment.name,
      noteReasons.tooLarge(formatBytes(attachmentLimits.maxTextFileBytes)),
    )
  }

  const text = new TextDecoder("utf-8").decode(await downloadAttachment(attachment))

  if (text.includes(nullCharacter)) {
    return attachmentNote(attachment.name, noteReasons.binary)
  }

  const document = wrapDocument({ name: attachment.name, kind: "text" }, text, state.budget)

  return document ?? attachmentNote(attachment.name, noteReasons.noBudget)
}
