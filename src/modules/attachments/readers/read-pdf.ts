import { extractText } from "unpdf"
import { attachmentLimits, formatBytes } from "../attachment-limits.ts"
import { attachmentNote, noteReasons } from "../attachment-notes.ts"
import type { AttachmentSource } from "../attachment-source.ts"
import { downloadAttachment } from "../download-attachment.ts"
import { wrapDocument } from "../wrap-document.ts"
import type { AttachmentPart, ReadState } from "./read-state.ts"

export async function readPdf(
  attachment: AttachmentSource,
  state: ReadState,
): Promise<AttachmentPart> {
  if (attachment.size > attachmentLimits.maxPdfBytes) {
    return attachmentNote(
      attachment.name,
      noteReasons.tooLarge(formatBytes(attachmentLimits.maxPdfBytes)),
    )
  }

  const { totalPages, text } = await extractText(await downloadAttachment(attachment), {
    mergePages: true,
  })

  if (text.trim().length === 0) {
    return attachmentNote(attachment.name, noteReasons.noPdfText)
  }

  const document = wrapDocument(
    { name: attachment.name, kind: "pdf", extra: `pages="${totalPages}"` },
    text.trim(),
    state.budget,
  )

  return document ?? attachmentNote(attachment.name, noteReasons.noBudget)
}
