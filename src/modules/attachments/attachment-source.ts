import type { Attachment } from "discord.js"

export type AttachmentSource = Pick<Attachment, "name" | "contentType" | "size" | "url">

export function mediaTypeOf(attachment: AttachmentSource): string {
  return (attachment.contentType ?? "").split(";")[0]?.trim().toLowerCase() ?? ""
}

export function extensionOf(attachment: AttachmentSource): string {
  const dot = attachment.name.lastIndexOf(".")

  return dot === -1 ? "" : attachment.name.slice(dot + 1).toLowerCase()
}
