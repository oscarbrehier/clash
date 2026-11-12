import { type Client, Events, type Interaction } from "discord.js"
import type { CoreContext } from "../context.ts"
import { replyEphemeralSafely } from "../discord/interaction-replies.ts"
import type { CommandDefinition } from "../modules/command-definition.ts"
import type { ComponentHandler } from "../modules/component-handler.ts"
import { type CommandIndex, indexCommands } from "./command-index.ts"
import { type ComponentIndex, indexComponents } from "./component-index.ts"
import { dispatchCommand } from "./dispatch-command.ts"
import { dispatchComponent } from "./dispatch-component.ts"

const guildOnlyMessage = "This bot only works inside its server."
const noAccessMessage = "You don't have access to this bot."
const failureMessage = "Something went wrong while handling that. Please try again."

interface Routes {
  commands: CommandIndex
  components: ComponentIndex
}

export function installInteractionRouter(
  client: Client,
  commands: readonly CommandDefinition[],
  components: readonly ComponentHandler[],
  context: CoreContext,
) {
  const log = context.logger.child("interactions")
  const routes: Routes = {
    commands: indexCommands(commands),
    components: indexComponents(components),
  }

  client.on(Events.InteractionCreate, async (interaction) => {
    try {
      await routeInteraction(interaction, routes, context)
    } catch (error) {
      log.error(`Interaction ${describeInteraction(interaction)} failed`, error)
      await replyWithFailure(interaction)
    }
  })
}

async function routeInteraction(interaction: Interaction, routes: Routes, context: CoreContext) {
  if (!interaction.inCachedGuild() || !context.access.isGuildAllowed(interaction.guildId)) {
    await rejectInteraction(interaction, guildOnlyMessage)
    return
  }

  if (!context.access.canUse(interaction.member)) {
    await rejectInteraction(interaction, noAccessMessage)
    return
  }

  if (await dispatchCommand(interaction, routes.commands, context)) {
    return
  }

  await dispatchComponent(interaction, routes.components, context)
}

async function rejectInteraction(interaction: Interaction, message: string) {
  if (interaction.isAutocomplete()) {
    await interaction.respond([])
    return
  }

  if (interaction.isRepliable()) {
    await replyEphemeralSafely(interaction, message)
  }
}

async function replyWithFailure(interaction: Interaction) {
  if (interaction.isRepliable()) {
    await replyEphemeralSafely(interaction, failureMessage)
  }
}

function describeInteraction(interaction: Interaction): string {
  const fallback = `#${interaction.id}`

  if (interaction.isCommand() || interaction.isAutocomplete()) {
    return `/${interaction.commandName}`
  }

  if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
    return interaction.customId
  }

  return fallback
}
