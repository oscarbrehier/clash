import type { ClientEvents } from "discord.js"
import type { CoreContext } from "../context.ts"

export type EventName = keyof ClientEvents

export interface EventHandler<E extends EventName> {
  event: E
  once?: boolean
  execute(context: CoreContext, ...args: ClientEvents[E]): Promise<void> | void
}

export type AnyEventHandler = { [E in EventName]: EventHandler<E> }[EventName]

export function defineEvent<E extends EventName>(handler: EventHandler<E>): EventHandler<E> {
  return handler
}
