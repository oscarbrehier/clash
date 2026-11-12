import type {
  ButtonInteraction,
  ModalSubmitInteraction,
  StringSelectMenuInteraction,
} from "discord.js"
import type { CoreContext } from "../context.ts"

export interface ButtonHandler {
  type: "button"
  id: string
  execute(
    interaction: ButtonInteraction<"cached">,
    args: string[],
    context: CoreContext,
  ): Promise<void>
}

export interface ModalHandler {
  type: "modal"
  id: string
  execute(
    interaction: ModalSubmitInteraction<"cached">,
    args: string[],
    context: CoreContext,
  ): Promise<void>
}

export interface StringSelectHandler {
  type: "string-select"
  id: string
  execute(
    interaction: StringSelectMenuInteraction<"cached">,
    args: string[],
    context: CoreContext,
  ): Promise<void>
}

export type ComponentHandler = ButtonHandler | ModalHandler | StringSelectHandler
