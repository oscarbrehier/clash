import type { ToolSet } from "ai"
import type { CoreContext } from "../context.ts"
import type { ChatHooks } from "../hooks/chat-hooks.ts"
import type { CommandDefinition } from "./command-definition.ts"
import type { ComponentHandler } from "./component-handler.ts"
import type { AnyEventHandler } from "./event-handler.ts"

export interface BotModule {
  name: string
  commands?: readonly CommandDefinition[]
  components?: readonly ComponentHandler[]
  events?: readonly AnyEventHandler[]
  tools?: ToolSet
  hooks?: Partial<ChatHooks>
  setup?(context: CoreContext): Promise<void> | void
}

export function defineModule(module: BotModule): BotModule {
  return module
}
