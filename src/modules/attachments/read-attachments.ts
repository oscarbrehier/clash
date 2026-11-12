import type { CoreContext } from "../../core/context.ts"
import type { UserContentParts, UserInputRequest } from "../../core/hooks/chat-hooks.ts"
import { attachmentLimits } from "./attachment-limits.ts"
import { attachmentNote, noteReasons } from "./attachment-notes.ts"
import type { AttachmentSource } from "./attachment-source.ts"
import { createCharacterBudget } from "./character-budget.ts"
import { classifyAttachment } from "./classify-attachment.ts"
import { readImage } from "./readers/read-image.ts"
import { readPdf } from "./readers/read-pdf.ts"
import type { AttachmentPart, ReadState } from "./readers/read-state.ts"
import { readTextFile } from "./readers/read-text-file.ts"

export async function readAttachments(
  request: UserInputRequest,
  context: CoreContext,
): Promise<UserContentParts> {
  const attachments = request.message ? [...request.message.attachments.values()] : []

  if (attachments.length === 0) {
    return request.parts
  }

  const state: ReadState = {
    model: request.model,
    budget: createCharacterBudget(attachmentLimits.maxCharactersPerMessage),
    imagesIncluded: 0,
  }

  const added: AttachmentPart[] = []

  for (const attachment of attachments) {
    added.push(await readSafely(attachment, state, context))
  }

  return [...request.parts, ...added]
}

async function readSafely(
  attachment: AttachmentSource,
  state: ReadState,
  context: CoreContext,
): Promise<AttachmentPart> {
  try {
    return await readAttachment(attachment, state)
  } catch (error) {
    context.logger.child("attachments").warn(`Could not read attachment ${attachment.name}`, error)
    return attachmentNote(attachment.name, noteReasons.failed)
  }
}

function readAttachment(attachment: AttachmentSource, state: ReadState): Promise<AttachmentPart> {
  switch (classifyAttachment(attachment)) {
    case "image":
      return readImage(attachment, state)

    case "pdf":
      return readPdf(attachment, state)

    case "text":
      return readTextFile(attachment, state)

    case "unsupported":
      return Promise.resolve(attachmentNote(attachment.name, noteReasons.unsupported))
  }
}
