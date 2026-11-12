import type { AutocompleteInteraction } from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import { modelChoices } from "../../../core/providers/model-choices.ts"

export async function autocompleteModel(
  interaction: AutocompleteInteraction<"cached">,
  context: CoreContext,
) {
  const focused = interaction.options.getFocused(true)

  await interaction.respond(
    focused.name === "model" ? modelChoices(context.models, focused.value) : [],
  )
}
