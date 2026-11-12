import { type AttachmentSource, extensionOf, mediaTypeOf } from "./attachment-source.ts"

export type AttachmentKind = "image" | "pdf" | "text" | "unsupported"

const imageMediaTypes = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"])

const textMediaTypes = new Set([
  "application/json",
  "application/xml",
  "application/javascript",
  "application/typescript",
  "application/x-yaml",
  "application/yaml",
  "application/toml",
  "application/x-sh",
  "application/sql",
])

const textExtensions = new Set([
  "txt",
  "md",
  "markdown",
  "csv",
  "tsv",
  "log",
  "json",
  "jsonc",
  "yaml",
  "yml",
  "toml",
  "ini",
  "xml",
  "html",
  "css",
  "scss",
  "js",
  "jsx",
  "mjs",
  "cjs",
  "ts",
  "tsx",
  "py",
  "rb",
  "go",
  "rs",
  "java",
  "kt",
  "c",
  "h",
  "cpp",
  "hpp",
  "cs",
  "php",
  "swift",
  "lua",
  "sql",
  "sh",
  "bash",
  "ps1",
  "bat",
  "dockerfile",
  "gradle",
  "vue",
  "svelte",
  "tex",
  "srt",
])

export function classifyAttachment(attachment: AttachmentSource): AttachmentKind {
  const mediaType = mediaTypeOf(attachment)
  const extension = extensionOf(attachment)

  if (imageMediaTypes.has(mediaType)) {
    return "image"
  }

  if (mediaType === "application/pdf" || extension === "pdf") {
    return "pdf"
  }

  if (
    mediaType.startsWith("text/") ||
    textMediaTypes.has(mediaType) ||
    textExtensions.has(extension)
  ) {
    return "text"
  }

  return "unsupported"
}
