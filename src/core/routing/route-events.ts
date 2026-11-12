import type { Client, ClientEvents } from "discord.js"
import type { CoreContext } from "../context.ts"
import type { Logger } from "../logging/logger.ts"
import type { AnyEventHandler, EventHandler, EventName } from "../modules/event-handler.ts"

export function bindModuleEvents(
  client: Client,
  handlers: readonly AnyEventHandler[],
  context: CoreContext,
) {
  const log = context.logger.child("events")

  for (const handler of handlers) {
    bindEvent(client, handler, context, log)
  }
}

function bindEvent<E extends EventName>(
  client: Client,
  handler: EventHandler<E>,
  context: CoreContext,
  log: Logger,
) {
  const listener = async (...args: ClientEvents[E]) => {
    try {
      await handler.execute(context, ...args)
    } catch (error) {
      log.error(`Handler for "${String(handler.event)}" failed`, error)
    }
  }

  if (handler.once) {
    client.once(handler.event, listener)
    return
  }

  client.on(handler.event, listener)
}
