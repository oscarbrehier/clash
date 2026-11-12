import { generateText, type LanguageModelUsage } from "ai"
import type { CoreContext } from "../../../core/context.ts"
import type { MessageRecord } from "../../../core/db/schema/messages.ts"
import { sanitizeTitle } from "./sanitize-title.ts"

const excerptLength = 1_500

const titleOutputTokens = 400

const titleTimeoutMs = 30_000

const titleInstructions = [
  "You name chat conversations.",
  "Reply with a short, specific title of 3 to 6 words that describes the topic.",
  "Reply with the title only: no quotes, no trailing punctuation, no emoji.",
  "Use the language of the conversation.",
].join(" ")

export interface GeneratedTitle {
  title: string | undefined
  usage: LanguageModelUsage
}

export async function generateTitle(
  context: CoreContext,
  history: readonly MessageRecord[],
): Promise<GeneratedTitle | undefined> {
  const firstUser = history.find((message) => message.role === "user")
  const firstAssistant = history.find((message) => message.role === "assistant")

  if (!firstUser || !firstAssistant) {
    return undefined
  }

  const result = await generateText({
    model: context.models.languageModel(context.models.titleModel()),
    instructions: titleInstructions,
    prompt: `User: ${excerpt(firstUser.content)}\n\nAssistant: ${excerpt(firstAssistant.content)}`,
    maxOutputTokens: titleOutputTokens,
    maxRetries: 1,
    timeout: titleTimeoutMs,
  })

  return { title: sanitizeTitle(result.text), usage: result.totalUsage }
}

function excerpt(text: string): string {
  return text.length > excerptLength ? `${text.slice(0, excerptLength)}…` : text
}
