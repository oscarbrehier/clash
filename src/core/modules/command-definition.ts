import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  MessageContextMenuCommandInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
  UserContextMenuCommandInteraction,
} from "discord.js"
import type { CoreContext } from "../context.ts"

export interface CommandData {
  name: string
  toJSON(): RESTPostAPIApplicationCommandsJSONBody
}

export interface SlashCommand {
  type: "slash"
  data: CommandData
  execute(interaction: ChatInputCommandInteraction<"cached">, context: CoreContext): Promise<void>
  autocomplete?(interaction: AutocompleteInteraction<"cached">, context: CoreContext): Promise<void>
}

export interface MessageContextCommand {
  type: "message-context"
  data: CommandData
  execute(
    interaction: MessageContextMenuCommandInteraction<"cached">,
    context: CoreContext,
  ): Promise<void>
}

export interface UserContextCommand {
  type: "user-context"
  data: CommandData
  execute(
    interaction: UserContextMenuCommandInteraction<"cached">,
    context: CoreContext,
  ): Promise<void>
}

export type CommandDefinition = SlashCommand | MessageContextCommand | UserContextCommand
