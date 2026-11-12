const megabyte = 1024 * 1024

export const attachmentLimits = {
  maxImagesPerMessage: 4,
  maxImageBytes: 5 * megabyte,
  maxTextFileBytes: megabyte / 2,
  maxPdfBytes: 20 * megabyte,
  maxCharactersPerFile: 60_000,
  maxCharactersPerMessage: 150_000,
  downloadTimeoutMs: 20_000,
} as const

export function formatBytes(bytes: number): string {
  return bytes >= megabyte ? `${Math.round(bytes / megabyte)} MB` : `${Math.round(bytes / 1024)} KB`
}
