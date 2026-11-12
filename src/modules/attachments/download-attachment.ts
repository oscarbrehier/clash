import { attachmentLimits } from "./attachment-limits.ts"
import type { AttachmentSource } from "./attachment-source.ts"

export async function downloadAttachment(attachment: AttachmentSource): Promise<Uint8Array> {
  const response = await fetch(attachment.url, {
    signal: AbortSignal.timeout(attachmentLimits.downloadTimeoutMs),
  })

  if (!response.ok) {
    throw new Error(`Downloading ${attachment.name} failed with status ${response.status}`)
  }

  return new Uint8Array(await response.arrayBuffer())
}
