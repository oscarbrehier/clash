import type { ChatInputCommandInteraction } from "discord.js"
import { replyEphemeral } from "../../../core/discord/interaction-replies.ts"
import { listPersonas, personaLabel } from "../persona-catalog.ts"

export async function listPersonasReply(interaction: ChatInputCommandInteraction<"cached">) {
  const lines = listPersonas().map(
    (persona) => `• **${personaLabel(persona)}** (\`${persona.id}\`) — ${persona.description}`,
  )

  await replyEphemeral(
    interaction,
    [
      "**Personas**",
      ...lines,
      "",
      "Use `/persona set` in a chat, or `/persona custom` to write your own.",
    ].join("\n"),
  )
}
