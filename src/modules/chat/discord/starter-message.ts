export function starterMessage(
  userId: string,
  prompt: string | undefined,
  attachmentNames: readonly string[] = [],
): string {
  const attachmentLine =
    attachmentNames.length > 0
      ? `\n📎 ${attachmentNames.map((name) => `\`${name}\``).join(", ")}`
      : ""

  if (!prompt) {
    return attachmentLine
      ? `<@${userId}> shared:${attachmentLine}`
      : `<@${userId}> started a new chat. Send a message to begin.`
  }

  const quoted = prompt
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n")

  return `<@${userId}> asked:\n${quoted}${attachmentLine}`
}
