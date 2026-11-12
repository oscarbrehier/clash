import type { ModelDefinition } from "../../../core/config/model-catalog.ts"

const discordFormattingGuide = [
  "Format replies for Discord.",
  "Use Markdown headings, lists, **bold**, `inline code` and fenced code blocks with a language tag.",
  "Discord does not render tables, LaTeX or HTML, so use lists or code blocks instead.",
  "Keep answers focused unless the user asks for more detail.",
].join(" ")

export function defaultPersona(model: ModelDefinition): string {
  return `You are ${model.displayName}, a helpful and knowledgeable assistant chatting with people in a private Discord server.`
}

export function composeInstructions(persona: string, now: Date = new Date()): string {
  const dateLine = `Current date: ${now.toISOString().slice(0, 10)}.`

  return [persona, discordFormattingGuide, dateLine].join("\n\n")
}
